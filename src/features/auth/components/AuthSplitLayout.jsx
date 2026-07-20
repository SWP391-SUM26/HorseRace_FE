import { cn } from "@/common/lib/cn";

export function AuthSplitLayout({
  imageSide,
  image,
  panel,
  children,
  formMaxWidth = "md",
}) {
  const visual = (
    <div
      className="relative hidden md:block bg-cover bg-center"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-brand-900/70 to-brand-900/80" />
      {panel && (
        <div className="relative z-10 flex h-full flex-col p-12 text-white">
          {panel}
        </div>
      )}
    </div>
  );

  const form = (
    <div className="flex min-h-screen flex-col overflow-y-auto bg-bg px-6 py-12">
      <div
        className={cn(
          "mx-auto w-full",
          formMaxWidth === "xl" ? "max-w-xl" : "max-w-md",
        )}
      >
        {children}
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {imageSide === "left" ? (
        <>
          {visual}
          {form}
        </>
      ) : (
        <>
          {form}
          {visual}
        </>
      )}
    </div>
  );
}
