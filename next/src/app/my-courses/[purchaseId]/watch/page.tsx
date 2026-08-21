import { VodPlayer } from "@/components/vod-player";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ purchaseId: string }>;
}) {
  const { purchaseId } = await params;
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <VodPlayer purchaseId={purchaseId} />
    </div>
  );
}
