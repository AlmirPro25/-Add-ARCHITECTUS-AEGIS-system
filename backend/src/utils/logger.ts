
export const Logger = {
  info: (msg: string, context?: any) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, context ? JSON.stringify(context) : '');
  },
  error: (msg: string, error?: any) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, error);
  },
  warn: (msg: string, context?: any) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, context ? JSON.stringify(context) : '');
  },
  tactical: (msg: string) => {
    console.log(`[TACTICAL] ⚡ ${msg}`);
  }
};
