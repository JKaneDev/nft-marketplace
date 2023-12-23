const { ethers } = require('hardhat');
const Auction = require('../abis/contracts/Auction.sol/Auction.json');
const AuctionFactory = require('../abis/contracts/AuctionFactory.sol/AuctionFactory.json');
const Marketplace = require('../abis/contracts/Marketplace.sol/Marketplace.json');
const { expect } = require('chai');

describe('AuctionFactory', () => {
	let auction;
	let auctionAddress;
	let marketplace;
	let marketplaceAddress;
	let factory;
	let factoryAddress;
	let accounts;
	let account1;
	let account2;
	let account3;
	let marketItemCreatedEvent;

	// Must deploy all app contracts before auction contract can be deployed
	beforeEach(async () => {
		accounts = await ethers.getSigners();
		deployer = accounts[0];
		account1 = accounts[1];
		account2 = accounts[2];
		account3 = accounts[3];

		/*
                     Deploy contracts and fetch addresses for use in auction contract
                     constructor function
              */
		const MarketplaceInstance = await ethers.getContractFactory('Marketplace');
		const AuctionFactory = await ethers.getContractFactory('AuctionFactory');
		marketplace = await MarketplaceInstance.deploy();
		marketplaceAddress = await marketplace.getAddress();
		factory = await AuctionFactory.deploy(marketplaceAddress);
		factoryAddress = await factory.getAddress();

		await marketplace.setAuctionFactoryAddress(factoryAddress);

		/*
                     Mint NFT and create market item, then delist it so it can be listed
                     in auction.
              */
		const tx = await marketplace.connect(account1).createToken(1, 10, ethers.parseEther('1'), {
			value: ethers.parseEther('0.0025'),
		});

		const receipt = await tx.wait(); // wait for tx receipt before proceeding

		await marketplace.connect(account1).delistMarketItem(1);

		/*
                     Parse event logs to get token id and create auction contract
              */
		const iface = new ethers.Interface(Marketplace.abi);
		const events = receipt.logs.map((log) => iface.parseLog(log)).filter((log) => log != null);
		marketItemCreatedEvent = events.find((event) => event.name === 'MarketItemCreated');
	});

	describe('Deployment', () => {
		it('should deploy the auction contract', async () => {
			const Auction = await ethers.getContractFactory('Auction');
			// Create auction contract with data parsed from event logs
			auction = await Auction.deploy(
				marketItemCreatedEvent.args[0],
				ethers.parseEther('1.5'),
				3600,
				account1.address,
				marketplaceAddress,
				factoryAddress,
			);
		});
	});

	describe('Contract state variable assignment', () => {
		beforeEach(async () => {
			const Auction = await ethers.getContractFactory('Auction');
			auction = await Auction.deploy(
				marketItemCreatedEvent.args[0],
				ethers.parseEther('1.5'),
				3600,
				account1.address,
				marketplaceAddress,
				factoryAddress,
			);
		});

		it('should set nftId correctly', async () => {
			expect(await auction.nftId()).to.equal(marketItemCreatedEvent.args[0]);
		});

		it('should set startingPrice correctly', async () => {
			expect(await auction.startingPrice()).to.equal(ethers.parseEther('1.5'));
		});

		it('should set seller correctly', async () => {
			expect(await auction.seller()).to.equal(account1.address);
		});

		it('should set marketplaceAddress correctly', async () => {
			expect(await auction.marketplaceAddress()).to.equal(marketplaceAddress);
		});

		it('should set end time correctly', async () => {
			const endTime = BigInt(Math.floor(Date.now() / 1000 + 3600));
			const auctionEndTime = await auction.auctionEndTime();
			const difference =
				auctionEndTime >= endTime ? auctionEndTime - endTime : endTime - auctionEndTime;
			const epsilon = BigInt(40);

			expect(difference).to.be.lessThan(epsilon);
		});
	});

	describe('Bidding', () => {
		let tokenId;
		let auctionInstance;
		let auctionAddress;

		beforeEach(async () => {
			tokenId = marketItemCreatedEvent.args[0];

			await marketplace.connect(account1).approve(marketplaceAddress, tokenId);
			await factory
				.connect(account1)
				.createAuction(ethers.parseEther('1'), 3600, tokenId, account1.address);

			// Get auction address from factory
			const auction = await factory.auctions(tokenId);
			auctionAddress = auction.auctionAddress;
			const Auction = await ethers.getContractFactory('Auction');

			// Connect to auction contract
			auctionInstance = Auction.attach(auctionAddress);
		});

		describe('Success', () => {
			it('Should a user to bid on an auction', async () => {
				await auctionInstance.connect(account2).bid({ value: ethers.parseEther('2') });
				expect(await auctionInstance.highestBidder()).to.equal(account2.address);
				expect(await auctionInstance.highestBid()).to.equal(ethers.parseEther('2'));
			});

			it('should set penultimate bidder correctly', async () => {
				await auctionInstance.connect(account2).bid({ value: ethers.parseEther('2') });
				await auctionInstance.connect(account3).bid({ value: ethers.parseEther('3') });
				expect(await auctionInstance.penultimateBidder()).to.equal(account2.address);
			});

			it('should set highest bidder correctly', async () => {
				await auctionInstance.connect(account2).bid({ value: ethers.parseEther('2') });
				await auctionInstance.connect(account3).bid({ value: ethers.parseEther('3') });
				expect(await auctionInstance.highestBidder()).to.equal(account3.address);
			});

			it('should set highest bid correctly', async () => {
				await auctionInstance.connect(account2).bid({ value: ethers.parseEther('2') });
				await auctionInstance.connect(account3).bid({ value: ethers.parseEther('3') });
				expect(await auctionInstance.highestBid()).to.equal(ethers.parseEther('3'));
			});

			it('should set pending returns correctly', async () => {
				await auctionInstance.connect(account2).bid({ value: ethers.parseEther('2') });
				await auctionInstance.connect(account3).bid({ value: ethers.parseEther('3') });
				expect(await auctionInstance.pendingReturns(account2.address)).to.equal(
					ethers.parseEther('2'),
				);
			});

			it('should refund the penultimate bidder correctly', async () => {
				const provider = ethers.provider;

				await auctionInstance.connect(account2).bid({ value: ethers.parseEther('2') });
				await auctionInstance.connect(account3).bid({ value: ethers.parseEther('3') });
				const pendingReturn = await auctionInstance.pendingReturns(account2.address);
				expect(pendingReturn).to.equal(ethers.parseEther('2'));

				const initialBalance = await provider.getBalance(account3.address);

				const tx = await auctionInstance.connect(account2).bid({ value: ethers.parseEther('4') });
				const receipt = await tx.wait();
				const gasUsed = receipt.gasUsed;
				const txCost = gasUsed * tx.gasPrice;

				const finalBalance = await provider.getBalance(account3.address);

				const finalBalanceAdjusted = finalBalance + txCost;

				expect(BigInt(finalBalanceAdjusted)).to.be.gt(initialBalance);
			});

			it('should emit a Bid event', async () => {
				await auctionInstance.connect(account2).bid({ value: ethers.parseEther('2') });
				await auctionInstance.connect(account3).bid({ value: ethers.parseEther('3') });
				const tx = await auctionInstance.connect(account2).bid({ value: ethers.parseEther('4') });
				const receipt = await tx.wait();
				const iface = new ethers.Interface(Auction.abi);
				const events = receipt.logs.map((log) => iface.parseLog(log)).filter((log) => log != null);
				const event = events.find((event) => event.name === 'Bid');
				expect(event.args[0]).to.equal(account2.address);
				expect(event.args[1]).to.equal(ethers.parseEther('4'));
				expect(event.args[2]).to.equal(auctionAddress);
			});
		});

		describe('Failure', () => {
			it('should disallow bids if the auction has ended', async () => {
				await auctionInstance.connect(account2).bid({ value: ethers.parseEther('2') });
				await auctionInstance.connect(account3).bid({ value: ethers.parseEther('3') });
				const tx = await auctionInstance.connect(account1).endAuction();
				const receipt = await tx.wait();
				if (receipt) await marketplace.connect(account3).revokeApproval(tokenId);
				await expect(
					auctionInstance.connect(account2).bid({ value: ethers.parseEther('5') }),
				).to.be.revertedWith('Auction has ended');
			});

			it('should disallow bids if the auction has ended due endTime reached', async () => {
				await ethers.provider.send('evm_increaseTime', [3601]);
				await ethers.provider.send('evm_mine');
				await auctionInstance.connect(account2).confirmAuctionEnd();
				await expect(
					auctionInstance.connect(account2).bid({ value: ethers.parseEther('5') }),
				).to.be.revertedWith('Auction has ended');
			});

			it('should disallow users from bidding on their own auctions', async () => {
				await expect(
					auctionInstance.connect(account1).bid({ value: ethers.parseEther('2') }),
				).to.be.revertedWith('Seller cannot bid on their own auction');
			});

			it('should disallow users from bidding less than the starting price', async () => {
				await expect(
					auctionInstance.connect(account2).bid({ value: ethers.parseEther('0.1') }),
				).to.be.revertedWith('Bid must be greater than or equal to starting price');
			});

			it('should disallow bids from the current highest bidder', async () => {
				await auctionInstance.connect(account2).bid({ value: ethers.parseEther('2') });
				await expect(
					auctionInstance.connect(account2).bid({ value: ethers.parseEther('3') }),
				).to.be.revertedWith('Bidder is already highest bidder');
			});

			it('should disallow bids that are not greater than the highest bid', async () => {
				await auctionInstance.connect(account2).bid({ value: ethers.parseEther('2') });
				await expect(
					auctionInstance.connect(account3).bid({ value: ethers.parseEther('1.5') }),
				).to.be.revertedWith('Bid must be greater than current highest bid');
			});
		});
	});

	describe('Ending Auction', () => {
		let tokenId;
		let auctionInstance;

		beforeEach(async () => {
			tokenId = marketItemCreatedEvent.args[0];

			await marketplace.connect(account1).approve(marketplaceAddress, tokenId);
			await factory
				.connect(account1)
				.createAuction(ethers.parseEther('1'), 3600, tokenId, account1.address);

			// Get auction address from factory
			const auction = await factory.auctions(tokenId);
			const auctionAddress = auction.auctionAddress;
			const Auction = await ethers.getContractFactory('Auction');

			// Connect to auction contract
			auctionInstance = Auction.attach(auctionAddress);
		});

		describe('Success', () => {
			it('should end auction when there are no bids', async () => {
				const tx = await auctionInstance.connect(account1).endAuction();
				const receipt = await tx.wait();
				if (receipt) await marketplace.connect(account1).revokeApproval(tokenId);
				expect(await auctionInstance.ended()).to.equal(true);
			});

			it('should end auction when there is a bid', async () => {
				await auctionInstance.connect(account2).bid({ value: ethers.parseEther('2') });
				const tx = await auctionInstance.connect(account1).endAuction();
				const receipt = await tx.wait();
				if (receipt) await marketplace.connect(account2).revokeApproval(tokenId);
				expect(await auctionInstance.ended()).to.equal(true);
			});

			it('should allow any user to end auction after duration has elapsed', async () => {
				await auctionInstance.connect(account2).bid({ value: ethers.parseEther('2') });
				await ethers.provider.send('evm_increaseTime', [3601]);
				await ethers.provider.send('evm_mine');
				await auctionInstance.connect(account2).confirmAuctionEnd();
				await auctionInstance.connect(account3).endAuction();
				expect(await auctionInstance.ended()).to.equal(true);
			});

			it.only('should transfer NFT back to the seller if no bids, if time elapsed and if ended by non-participant', async () => {
				await ethers.provider.send('evm_increaseTime', [3601]);
				await ethers.provider.send('evm_mine');
				const tx = await auctionInstance.connect(account2).confirmAuctionEnd();
				const receipt = await tx.wait();
				if (receipt) await auctionInstance.connect(account3).endAuction();
				expect(await marketplace.ownerOf(tokenId)).to.equal(account1.address);
			});

			it('should transfer the NFT to the highest bidder on auction end', async () => {
				await auctionInstance.connect(account2).bid({ value: ethers.parseEther('2') });
				const tx = await auctionInstance.connect(account1).endAuction();
				const receipt = await tx.wait();
				if (receipt) await marketplace.connect(account2).revokeApproval(tokenId);
				expect(await marketplace.ownerOf(tokenId)).to.equal(account2.address);
			});

			it('should transfer ownership accordingly after non-participant ends auction after time elapsed', async () => {
				await auctionInstance.connect(account2).bid({ value: ethers.parseEther('2') });
				await ethers.provider.send('evm_increaseTime', [3601]);
				await ethers.provider.send('evm_mine');
				await auctionInstance.connect(account2).confirmAuctionEnd();
				await auctionInstance.connect(account3).endAuction();
				expect(await marketplace.ownerOf(tokenId)).to.equal(account2.address);
			});

			it('should transfer the highest bid to the seller on auction end', async () => {
				await auctionInstance.connect(account2).bid({ value: ethers.parseEther('2') });
				const initialBalance = await ethers.provider.getBalance(account1.address);
				const tx = await auctionInstance.connect(account1).endAuction();
				const receipt = await tx.wait();
				if (receipt) await marketplace.connect(account2).revokeApproval(tokenId);
				const finalBalance = await ethers.provider.getBalance(account1.address);
				expect(BigInt(finalBalance)).to.be.gt(initialBalance);
			});

			it('should transfer fee to marketplace on auction end', async () => {
				await auctionInstance.connect(account2).bid({ value: ethers.parseEther('2') });
				const initialBalance = await ethers.provider.getBalance(marketplaceAddress);
				const tx = await auctionInstance.connect(account1).endAuction();
				const receipt = await tx.wait();
				if (receipt) await marketplace.connect(account2).revokeApproval(tokenId);
				const finalBalance = await ethers.provider.getBalance(marketplaceAddress);
				expect(BigInt(finalBalance)).to.be.gt(initialBalance);
			});

			it('should refund the penultimate bidder on auction end', async () => {
				await auctionInstance.connect(account2).bid({ value: ethers.parseEther('2') });
				await auctionInstance.connect(account3).bid({ value: ethers.parseEther('3') });
				const initialBalance = await ethers.provider.getBalance(account2.address);
				const tx = await auctionInstance.connect(account1).endAuction();
				const receipt = await tx.wait();
				if (receipt) await marketplace.connect(account3).revokeApproval(tokenId);
				const finalBalance = await ethers.provider.getBalance(account2.address);
				expect(BigInt(finalBalance)).to.be.gt(initialBalance);
			});

			it('should change active status of auction in auction factory on auction end', async () => {
				await auctionInstance.connect(account2).bid({ value: ethers.parseEther('2') });
				const tx = await auctionInstance.connect(account1).endAuction();
				const receipt = await tx.wait();
				if (receipt) await marketplace.connect(account2).revokeApproval(tokenId);
				const auction = await factory.auctions(tokenId);
				const activeAuctionIds = await factory.getActiveAuctionIds();
				expect(auction.active).to.equal(false);
				expect(activeAuctionIds.length).to.equal(0);
			});

			it('should emit an AuctionEnded event', async () => {
				await auctionInstance.connect(account2).bid({ value: ethers.parseEther('2') });
				const tx = await auctionInstance.connect(account1).endAuction();
				const receipt = await tx.wait();
				if (receipt) await marketplace.connect(account2).revokeApproval(tokenId);
				const iface = new ethers.Interface(Auction.abi);
				const events = receipt.logs.map((log) => iface.parseLog(log)).filter((log) => log != null);
				const event = events.find((event) => event.name === 'AuctionEnded');
				expect(event.args[0]).to.equal(tokenId);
				expect(event.args[1]).to.equal(account2.address);
				expect(event.args[2]).to.equal(account1.address);
				expect(event.args[3]).to.equal('0x0000000000000000000000000000000000000000');
				expect(event.args[4]).to.equal(ethers.parseEther('2'));
			});
		});

		describe('Failure', () => {
			it('should disallow participants from ending auctions when the end time has not been reached', async () => {
				await expect(auctionInstance.connect(account2).endAuction()).to.be.revertedWith(
					'Cannot end auction if not seller or if end time has not been reached',
				);
			});

			it('should disallow participants from confirming auction end before elapsed duration', async () => {
				await expect(auctionInstance.connect(account2).confirmAuctionEnd()).to.be.revertedWith(
					'Auction has not ended yet',
				);
			});
		});
	});
});
