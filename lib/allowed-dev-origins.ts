import { networkInterfaces } from "node:os";

type NetworkInterfaceLike = {
  address: string;
  family: string | number;
};

type NetworkInterfaceMap = Record<
  string,
  readonly NetworkInterfaceLike[] | undefined
>;

export function isTailscaleIpv4(address: string): boolean {
  const octets = address.split(".").map(Number);

  return (
    octets.length === 4 &&
    octets.every((octet) => Number.isInteger(octet) && octet >= 0 && octet <= 255) &&
    octets[0] === 100 &&
    octets[1] >= 64 &&
    octets[1] <= 127
  );
}

export function collectAllowedDevOrigins(
  interfaces: NetworkInterfaceMap = networkInterfaces(),
): string[] {
  const origins = new Set(["127.0.0.1"]);

  for (const entries of Object.values(interfaces)) {
    for (const entry of entries ?? []) {
      const isIpv4 = entry.family === "IPv4" || entry.family === 4;

      if (isIpv4 && isTailscaleIpv4(entry.address)) {
        origins.add(entry.address);
      }
    }
  }

  return [...origins];
}
