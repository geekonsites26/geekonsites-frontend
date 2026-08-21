import Container from "./Container"

export default function Section({ as = "section", contained = true, className = "", innerClassName = "", children, ...props }) {
  const Tag = as
  return (
    <Tag className={`py-12 sm:py-20 lg:py-28 ${className}`} {...props}>
      {contained ? <Container className={innerClassName}>{children}</Container> : children}
    </Tag>
  )
}
