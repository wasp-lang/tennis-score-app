export function AuthLayout(props: React.PropsWithChildren<{}>) {
  return (
    <main className="max-w-lg mx-auto p-8 border shadow-md rounded-md bg-white mt-16">
      {props.children}
    </main>
  );
}
