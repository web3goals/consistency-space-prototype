import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Activity } from "../typechain-types/contracts/Activity";
import { Activity__factory } from "../typechain-types/factories/contracts/Activity__factory";

describe.only("Activity", function () {
  async function defaultFixture() {
    // Define signers
    const [deployer, userOne, userTwo, userThree] = await ethers.getSigners();
    // Deploy contract
    const activityContract: Activity = await new Activity__factory(
      deployer
    ).deploy();
    return {
      activityContract,
      deployer,
      userOne,
      userTwo,
      userThree,
    };
  }

  it("Should create an activity, add check-ins by the owner, add reactions by other users", async function () {
    const { activityContract, userOne, userTwo, userThree } = await loadFixture(
      defaultFixture
    );
    // Create activity
    await expect(
      activityContract
        .connect(userOne)
        .create("Helping beginner developers", 0, 0, {})
    ).to.be.not.reverted;
    const activityId = await activityContract.getCurrentCounter();
    // Check activity params
    const params = await activityContract.getParams(activityId);
    expect(params.description).to.be.eq("Helping beginner developers");
    // Check in activity by not owner and by owner
    await expect(
      activityContract.connect(userTwo).checkIn(activityId)
    ).to.be.revertedWith("Not owner");
    await expect(activityContract.connect(userOne).checkIn(activityId)).to.be
      .not.reverted;
    await expect(activityContract.connect(userOne).checkIn(activityId)).to.be
      .not.reverted;
    // Check activity checkins
    const checkIns = await activityContract.getCheckIns(activityId);
    expect(checkIns.length).to.be.eq(2);
    // Add reactions
    await expect(activityContract.connect(userOne).addReaction(activityId, 0))
      .to.be.not.reverted;
    await expect(activityContract.connect(userTwo).addReaction(activityId, 0))
      .to.be.not.reverted;
    await expect(
      activityContract.connect(userTwo).addReaction(activityId, 0)
    ).to.be.revertedWith("Already added");
    // Check reactions
    const reactions = await activityContract.getReactions(activityId, 0);
    expect(reactions.length).to.be.equal(2);
  });

  it("Should create activities for different users", async function () {
    const { activityContract, userOne, userTwo, userThree } = await loadFixture(
      defaultFixture
    );
    // Check activities
    await expect(
      activityContract.connect(userOne).create("DESCRIPTION_1", 0, 0, {})
    ).to.be.not.reverted;
    await expect(
      activityContract.connect(userTwo).create("DESCRIPTION_2", 0, 0, {})
    ).to.be.not.reverted;
    await expect(
      activityContract.connect(userOne).create("DESCRIPTION_3", 0, 0, {})
    ).to.be.not.reverted;
    // Check activities
    expect(await activityContract.balanceOf(userOne.address)).to.be.equal(2);
    expect(
      await activityContract.tokenOfOwnerByIndex(userOne.address, 0)
    ).to.be.equal(1);
    expect(
      await activityContract.tokenOfOwnerByIndex(userOne.address, 1)
    ).to.be.equal(3);
  });
});
