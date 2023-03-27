import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import style from "./index.less"


const WordPad = (props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  let minY = Infinity, maxY = 0;
  let minX = Infinity, maxX = 0;
  const findYMinAndMax = (y: number) => {
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  const findXMinAndMax = (x: number) => {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
  }
  useEffect(() => {
    let canvasEl = canvasRef.current!
    let canvasInstance = canvasEl.getContext('2d')!;
    canvasEl.width = window.innerWidth;
    canvasEl.ontouchstart = function (e: TouchEvent) {
      e.preventDefault && e.preventDefault();
      let touchOptions = e.touches[0];
      canvasInstance.beginPath();
      // 记录用户当前书写的点位
      let x = touchOptions.pageX - canvasEl.offsetLeft;
      let y = touchOptions.pageY - canvasEl.offsetTop;
      findYMinAndMax(y)
      findXMinAndMax(x)
      canvasInstance.moveTo(x, y);
      canvasEl.ontouchmove = function (e) {
        let touchOptions = e.touches[0];
        // 记录用户当前书写的点位
        let x = touchOptions.pageX - canvasEl.offsetLeft;
        let y = touchOptions.pageY - canvasEl.offsetTop;
        findYMinAndMax(y)
        findXMinAndMax(x)
        canvasInstance.lineTo(x, y);
        canvasInstance.stroke();
        e.preventDefault && e.preventDefault();
      };
    }

    const documentTouchend = function () {
      canvasEl.ontouchmove = null;
    };
    document.addEventListener('touchend', documentTouchend)
    return () => {
      canvasEl.ontouchstart = canvasEl.ontouchmove = null
      document.removeEventListener('touchend', documentTouchend)
    }
  }, [])

  useImperativeHandle(ref, () => ({
    // 清空canvas
    clear: () => {
      canvasRef.current?.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      minY = minX = Infinity, maxY = maxX = 0;
    },
    getUrl: () => {
      let canvas = canvasRef.current!
      // 频繁使用getImageData方法可能存在性能问题， 所以需要设置{ willReadFrequently: true }，但是我设置了之后好像没效果，还是有警告
      let context = canvas.getContext("2d", { willReadFrequently: true })!;
      let canvasTmp = document.createElement('canvas')
      let initUrl = canvasTmp?.toDataURL("image/png");
      if (minY !== Infinity && minX !== Infinity) {
        /* 
            找到用户在画布上具体的签名位置，并抠出来
            下面的 +20和-10主要是为了留一些白边
        */
        canvasTmp.width = maxX - minX + 20
        canvasTmp.height = maxY - minY + 20
        canvasTmp.getContext("2d")?.putImageData(context.getImageData(minX - 10, minY - 10, canvasTmp.width, canvasTmp.height), 0, 0);
      }
      let curUrl = canvasTmp?.toDataURL("image/png");
      // 保存最初始的URL和当前URL，方便后续判断用户是否有签名
      return [initUrl, curUrl]
    }
  }))

  return (
    <div style={{
      position: "relative",
      zIndex: 0,
    }}>
      <div className={style.mask}>
        <div>
          <p>此 处</p>
          <p>签 名</p>
        </div>
      </div>
      <canvas style={{ 'backgroundColor': 'transparent', position: "relative", zIndex: 2 }} ref={canvasRef} height="500" />
    </div>
  )
}
export default forwardRef(WordPad)
