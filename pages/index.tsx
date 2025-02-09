import { MainSection } from "@/components/layout/main-section";
import { Button, IllustrationHuman } from "@aragon/ods";
import { useEffect, type ReactNode } from "react";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { Else, If, Then } from "@/components/if";
import { PUB_APP_NAME } from "@/constants";
import router from "next/router";

export default function StandardHome() {
  const { isConnected } = useAccount();
  const { open } = useWeb3Modal();

  return (
    <MainSection narrow>
      <Card>
        <h1 className="line-clamp-1 flex flex-1 shrink-0 text-2xl font-normal leading-tight text-neutral-800 md:text-3xl">
          Welcome to {PUB_APP_NAME}
        </h1>
        <p className="text-md text-neutral-400">
          Our modular DAO empowers you to govern and manage a decentralized insurance system with complete transparency
          and community-driven decision-making.
          <br />
          <br />
          {isConnected ? (
            <>
              ✅ <strong>Set Up Your Delegate Profile</strong> – Build trust and gain influence in DAO governance.
              <br />✅ <strong>Represent the Community</strong> – Show your expertise and participate in
              decision-making.
              <br />✅ <strong>Earn Delegations</strong> – Increase your voting power as members delegate their votes to
              you.
            </>
          ) : (
            <>
              ✅ <strong>Vote with Tokens</strong> – Influence decisions through a fair, token-based voting system.
              <br />✅ <strong>Create and Vote on Proposals</strong> – Shape policies and claims by participating in
              governance.
              <br />✅ <strong>Pay Premiums Seamlessly</strong> – Contribute to the insurance pool in a secure and
              decentralized way.
              <br />✅ <strong>Submit and Process Claims</strong> – Ensure a transparent and efficient claims process
              without intermediaries.
              <br />✅ <strong>Connect Your Wallet</strong> – Interact directly with the DAO using your crypto wallet.
            </>
          )}
          <br />
          <br />
          Join us in redefining insurance—decentralized, community-driven, and trustless. 🚀
        </p>
        <div className="">
          <IllustrationHuman className="mx-auto mb-6 max-w-96" body="BLOCKS" expression="SMILE_WINK" hairs="CURLY" />
          <div className="flex justify-center">
            <If true={isConnected}>
              <Then>
                <Button className="mb-2" variant="primary" onClick={() => router.push("/plugins/members/#/")}>
                  Click here to start building your delegate profile
                </Button>
              </Then>
              <Else>
                <Button size="md" variant="primary" onClick={() => open()}>
                  <span>Connect wallet to get started</span>
                </Button>
              </Else>
            </If>
          </div>
        </div>
      </Card>
    </MainSection>
  );
}

// This should be encapsulated
const Card = function ({ children }: { children: ReactNode }) {
  return (
    <div
      className="xs:px-10 mb-3 box-border flex
    w-full flex-col space-y-6
    rounded-xl border border-neutral-100
    bg-neutral-0 px-4 py-5 focus:outline-none focus:ring focus:ring-primary
    md:px-6 lg:px-7"
    >
      {children}
    </div>
  );
};
