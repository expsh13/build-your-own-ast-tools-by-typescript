export function error(message: string): void {
  console.error(`[ERROR] ${message}`);
}

export function info(message: string): void {
  console.log(`[INFO] ${message}`);
}

export function warn(message: string): void {
  console.warn(`[WARN] ${message}`);
}

export function success(message: string): void {
  console.log(`[SUCCESS] ${message}`);
}

export function debug(message: string): void {
  if (process.env.DEBUG === "true") {
    console.log(`[DEBUG] ${message}`);
  }
}
