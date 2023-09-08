import "@styles/global.scss";
import BackgroundGradient from "@components/backgroundGradient";
import GlobalNav from "@components/globalNav";
import { Suspense } from "react";
import Loading from "./loading";
import PageWrapper from "./pageWrapper";
// import { useRouter, u } from "next/navigation";

export const metadata = {
  title: "DropHacker", // page Title
  description: "Discover and Share Description",
};

export default function Layout({ children }: any) {
  // const {  } = useRouter();
  return (
    <html>
      <body>
        {/* <div className="background"/> */}
        <Suspense fallback={<Loading />}>
          <GlobalNav />
          <div className="app">
            <PageWrapper>
              {children}
            </PageWrapper>
          </div>
          <BackgroundGradient />
        </Suspense>
      </body>
    </html>
  );
}
