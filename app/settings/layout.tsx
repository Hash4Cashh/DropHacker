import SecondaryNav from "@components/secondaryNav";

export const metadata = {
  title: "DropHacker", // page Title
  description: "Discover and Share Description",
};

const settingsLinks = [
  { text: "Providers", href: "/settings" },
  { text: "Exchanges", href: "/settings/exchanges" },
];
export default function Layout({ children }: any) {

  return (
    <div className="container">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Settings
      </h1>
      <SecondaryNav links={settingsLinks} />
      {children}
    </div>
  );
}
