// エラーハンドリングを行う関数を定義

export const handleApiRequest = async <T>(
  request: Promise<any>
): Promise<T> => {
  try {
    const response = await request;
    console.log("API request successful:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("API request failed:", error);
    throw error;
  }
};
