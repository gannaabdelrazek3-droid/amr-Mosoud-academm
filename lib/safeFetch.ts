export async function safeFetchJson<T = Record<string, unknown>>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; data: T | null; error: string }> {
  try {
    const res = await fetch(url, options)
    const text = await res.text()

    let data: T | null = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      return {
        ok: false,
        data: null,
        error: 'الخادم رجّع صفحة غير متوقعة (الـ API غير موجود أو السيرفر يحتاج إعادة تشغيل)',
      }
    }

    if (!res.ok) {
      const errMsg = (data as { error?: string } | null)?.error || `حدث خطأ (كود ${res.status})`
      return { ok: false, data: null, error: errMsg }
    }

    return { ok: true, data, error: '' }
  } catch {
    return { ok: false, data: null, error: 'فشل الاتصال بالسيرفر، تأكدي من الاتصال بالإنترنت' }
  }
}