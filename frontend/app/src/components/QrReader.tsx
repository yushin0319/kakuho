import { useEffect } from "react";
import { useZxing } from "react-zxing";

interface QrReaderProps {
  onResult: (result: string) => void;
  onReady: () => void;
}

const QrReader = ({ onResult, onReady }: QrReaderProps) => {
  const { ref } = useZxing({
    onDecodeResult(result) {
      onResult(result.getText()); // スキャン結果を親に渡す
    },
  });

  // QRリーダーの準備が完了したらonReadyを呼ぶ
  useEffect(() => {
    const openCamera = async () => {
      const video = ref.current;
      if (video) {
        await video.play();
        onReady();
      }
    };
    openCamera();
  }, []);

  return (
    <video
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
      }}
      autoPlay
      muted
    />
  );
};

export default QrReader;
