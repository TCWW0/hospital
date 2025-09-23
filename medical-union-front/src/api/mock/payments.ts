// Mock payment gateway for prototype
export async function initiatePayment(orderId: string, method: 'wechat' | 'alipay' | 'ehealth'): Promise<{ paymentId: string; status: 'success' | 'fail' | 'pending' }> {
  // use args to avoid unused param diagnostics
  void orderId; void method;
  // simulate small chance of failure
  const ok = Math.random() > 0.05;
  return new Promise(resolve => setTimeout(() => resolve({ paymentId: 'pay_' + Math.random().toString(36).slice(2,8), status: ok ? 'success' : 'fail' }), 300));
}
