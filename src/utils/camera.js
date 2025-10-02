export async function attachCameraStream(video, { onError } = {}) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("API de câmera não suportada");
  }

  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  if (!video) return stream;
  video.srcObject = stream;
  try {
    await video.play();
  } catch (error) {
    if (error?.name === "AbortError") {
      console.info("Reprodução da câmera interrompida (AbortError)", error);
    } else {
      if (typeof onError === "function") onError(error);
      throw error;
    }
  }
  return stream;
}

export function stopStream(stream) {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}
