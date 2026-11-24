export function SourceCredit({ source }: { source?: string }) {
  return (
    <p className="text-xs leading-relaxed text-muted-foreground [&_a]:underline [&_a]:underline-offset-2">
      {source && (
        <>
          <a href={source}>View source record</a> ·{" "}
        </>
      )}
      <a href="https://www.openstreetmap.org/copyright">
        © OpenStreetMap contributors
      </a>
      {" · "}
      <a href="/directory/open-data">Download ODbL data</a>
    </p>
  );
}
