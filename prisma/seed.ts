import { Coin, Contract, PrismaClient } from "@prisma/client";
import {
  coinsSeed,
  contractsSeed,
  tasksSeed,
  providersSeed,
  exchangesSeed,
} from "./seeds";
import { ethers } from "ethers";

const prisma = new PrismaClient();

// npx prisma migrate reset
// npx prisma migrate dev --name init1
// npx prisma db seed
// npx prisma studio

async function main() {
  for (const coin of coinsSeed) {
    await prisma.coin.create({
      data: coin as Coin,
    });
  }
  console.log(`🟢 Created all coins: ${contractsSeed.length}`);

  for (const contract of contractsSeed) {
    await prisma.contract.create({
      data: contract as Contract,
    });
  }
  console.log(`🟢 Created all contracts: ${contractsSeed.length}`);

  const group = await prisma.accountsGroup.create({
    data: {
      name: "Default Group",
    },
  });

  for (let i = 0; i < 10; i++) {
    const wallet = ethers.Wallet.createRandom();
    await prisma.account.create({
      data: {
        privateKey: wallet.privateKey,
        address: wallet.address,
        name: `Wallet ${i + 1}`,
        groupId: group.id,
      },
    });
  }
  console.log(`🟢 Random 10 Wallets was generated`);

  for (const task of tasksSeed) {
    const newTask = await prisma.task.create({
      data: {
        name: task.name,
      },
    });

    for (const step of task.steps) {
      await prisma.taskStep.create({
        data: {
          ...step,
          taskId: newTask.id,
          args: JSON.stringify(step.args),
        },
      });
    }
  }
  console.log(`🟢 Create Tasks ${tasksSeed.length}`);

  for (const provider of providersSeed) {
    await prisma.provider.create({
      data: provider,
    });
  }
  console.log(`🟢 Create Providers ${providersSeed.length}`);

  for (const ex of exchangesSeed) {
    await prisma.exchange.create({
      data: { 
        ...ex, 
        credentials: JSON.stringify(ex.credentials) 
    },
    });
  }
  console.log(`🟢 Create Exchanges ${exchangesSeed.length}`);
}

main()
  .then(() => {
    prisma.$disconnect().catch(console.error);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect().catch(console.error);
    process.exit(1);
  });
