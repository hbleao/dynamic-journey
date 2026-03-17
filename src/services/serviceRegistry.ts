export type ServiceResult =
  | { success: true; data: unknown }
  | { success: false; error: string; data?: unknown };

type ServiceHandler = (input: unknown) => Promise<ServiceResult>;

const eligibility: ServiceHandler = async (input: unknown) => {
  return { success: true, data: { eligible: true, input } };
};

const handlers: Record<string, ServiceHandler> = {
  eligibility,
};

export async function callService(
  serviceName: string,
  input: unknown,
): Promise<ServiceResult> {
  const handler = handlers[serviceName];
  if (!handler) {
    return { success: false, error: `Serviço não registrado: ${serviceName}` };
  }
  return handler(input);
}
