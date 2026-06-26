export const usePageSize = () => {
  const pageWidth = useState<number | null>('pageSize:width', () => null)
  const pageHeight = useState<number | null>('pageSize:height', () => null)

  return { pageWidth, pageHeight }
}
