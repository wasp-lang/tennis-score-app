export function AuthLayout(props: React.PropsWithChildren<{}>) {
  return (
    <main className="mx-auto mt-16 max-w-lg rounded-md border bg-white p-8 shadow-md">
      {props.children}
    </main>
  )
}
