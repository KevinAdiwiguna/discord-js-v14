export async function getJson(url, options) {
  try {
    const response = options ? await fetch(url, options) : await fetch(url)
    const json = await response.json()
    return {
      status: response.status,
      data: json,
    }
  } catch (error) {
    return {
      success: false,
    };
  }

}
