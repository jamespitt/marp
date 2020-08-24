import { useLayoutEffect, useRef, useState, RefObject } from 'react'
import Sticky from 'wil-react-sticky'
import { Navigation } from 'components/docs/Navigation'

const useElementY = () => {
  const ref = useRef<HTMLElement>(null)
  const [y, setY] = useState(0)

  useLayoutEffect(() => {
    const { current } = ref
    if (!current) return

    const handleResize = () =>
      setY(current.getBoundingClientRect().y + window.scrollY)

    if (window.ResizeObserver) {
      const observer = new ResizeObserver(handleResize)

      observer.observe(current)
      return () => observer.disconnect()
    } else {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  return [ref as RefObject<any>, y] as const
}

export const Desktop: React.FC = ({ children }) => {
  const [containerRef, containerY] = useElementY()
  const sidebarStickyRef = useRef<Sticky>(null)
  const contentsStickyRef = useRef<Sticky>(null)

  useLayoutEffect(() => {
    const handleResize = () => {
      sidebarStickyRef.current?.['handleWindowScroll']()
      contentsStickyRef.current?.['handleWindowScroll']()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      id="docs-container"
      className="text-sm xl:text-base"
      ref={containerRef}
    >
      <div style={{ gridArea: 'sidebar' }}>
        <Sticky
          offsetTop={containerY}
          containerSelectorFocus="#docs-container"
          ref={sidebarStickyRef}
        >
          <div className="p-6 w-64 mx-auto">
            <Navigation />
          </div>
        </Sticky>
      </div>
      <div className="w-px bg-gray-400 my-6" style={{ gridArea: 'border' }} />
      <div style={{ gridArea: 'contents' }}>
        <Sticky
          offsetTop={containerY}
          containerSelectorFocus="#docs-container"
          ref={contentsStickyRef}
        >
          <div className="p-6">
            <article className="container mx-auto">{children}</article>
          </div>
        </Sticky>
      </div>
      <style jsx>{`
        #docs-container {
          @apply grid;

          min-height: inherit;
          grid-template-areas: 'sidebar border contents';
          grid-template-rows: 1fr;
          grid-template-columns: minmax(16rem, 25%) 1px 1fr;
        }
      `}</style>
    </div>
  )
}
