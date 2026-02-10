import { cn } from '@/lib/utils'

interface ContainerProps {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'section' | 'main'
}

export function Container({ children, className, as: Tag = 'div' }: ContainerProps) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full max-w-[var(--container-max)] px-[var(--container-padding)]',
        className
      )}
    >
      {children}
    </Tag>
  )
}
