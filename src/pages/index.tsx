import { useRef } from "react";
import WordPad from "../components/WordPad"

export default function Signature() {
  const wordPadRef = useRef(null)

  const clear = () => {
    wordPadRef.current?.clear()
  }
  const submit = async () => {
    let [origin, current] = wordPadRef.current?.getUrl()
    if (origin === current) {
      alert('请签名')
      return
    }
    /* 转blob */
    let arr = current.split(","),
      mime = arr[0].match(/:(.*?);/)[1], // 此处得到的为文件类型
      bstr = atob(arr[1]), // 此处将base64解码
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    // 通过以下方式将以上变量生成文件对象，三个参数分别为文件内容、文件名、文件类型
    let blob = new Blob([u8arr], { type: mime })
    let url = URL.createObjectURL(blob)
    window.open(url, "_blank")
  }
  return (
    <>
      <WordPad ref={wordPadRef}></WordPad>
      <div className="px-4 py-3 text-right sm:px-6 h-20 left-0 right-0 w-full"></div>
      <div className="bg-gray-50 px-4 py-3 text-right sm:px-6 fixed bottom-0 left-0 right-0 w-full pb-8">
        <button
          style={{
            border: "1px solid rgb(79 70 229 / var(--tw-bg-opacity))",
            color: 'rgb(79 70 229 / var(--tw-bg-opacity))'
          }}
          onClick={() => clear()}
          className="inline-flex justify-center rounded-md  py-2 px-6 text-base font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 mr-3"
        >
          清除签名
        </button>
        <button
          onClick={() => submit()}
          className="inline-flex justify-center rounded-md bg-indigo-600 py-2 px-6 text-base font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          提交签名
        </button>
      </div>
    </>
  )
}
