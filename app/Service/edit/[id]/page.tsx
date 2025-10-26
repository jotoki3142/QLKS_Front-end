import EditServiceClient from './EditServiceClient';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditServicePage(props: PageProps) {
  const { id } = await props.params;
  const serviceId = Number(id);
  return <EditServiceClient serviceId={serviceId} />;
}