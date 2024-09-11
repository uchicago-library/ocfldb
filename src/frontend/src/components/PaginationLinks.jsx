const PaginationLinks = ({page, pageFun, totalPages}) => {
  const pageRange = 5
  //const loPage = page - pageRange > 1 ? page - pageRange : 1
  //const hiPage = page + pageRange < totalPages ? page + pageRange : totalPages
  const loPage = page - pageRange
  const hiPage = page + pageRange

  let pages = []
  if (loPage > 1) {
    pages.push(<button onClick={pageFun(1)}>1</button>)
    pages.push(<button onClick={pageFun(page => page - 1)}>prev</button>)
  }
  for (let p = loPage; p <= hiPage; p++) {
    pages.push(<button onClick={pageFun((p) => p)} disabled={page == p}>{p}</button>)
  }
  if (hiPage < totalPages) {
    pages.push(<button onClick={pageFun(page => page + 1)}>next</button>)
    pages.push(<button onClick={pageFun(totalPages => totalPages)}>{totalPages}</button>)
  }
  return <>{pages}</>
};
export default PaginationLinks;
