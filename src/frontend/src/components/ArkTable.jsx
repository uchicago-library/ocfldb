import React, { useEffect, useMemo, useRef, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Cell from "./Cell";
import PaginationLinks from "./PaginationLinks";

const columns = [
  {
    accessorKey: "ark",
    cell: Cell,
    enableFiltering: true,
    enableSorting: true,
    filterFn: "includesString",
    header: "ARK",
    size: 50
  },
  {
    accessorKey: "original_identifier",
    cell: Cell,
    enableFiltering: true,
    enableSorting: true,
    filterFn: "includesString",
    header: "Original Identifier",
    size: 250
  },
  {
    accessorKey: "project",
    cell: Cell,
    enableFiltering: true,
    enableSorting: true,
    filterFn: "includesString",
    header: "Project",
    size: 600
  }
];

const fetchFilteredAndSortedData = async ({ filterFor, filterIn, pagination, sorting }) => {
  let params = {
    'page': 0,
    'pageSize': pagination.pageSize
  }
  if (filterFor && filterIn) {
    params[filterIn] = filterFor
  }
  if (sorting.length) {
    params['sortBy'] = sorting[0].id
    params['order'] = sorting[0].desc ? 'desc' : 'asc'
  }
  let url;
  if (Object.keys(params).length) {
    url = '/data?' + new URLSearchParams(params).toString()
  } else {
    url = '/data'
  }
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Response error')
  }
  return response.json()
}

const ArkTable = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [filterFor, setFilterFor] = useState('')
  const [filterIn, setFilterIn] = useState('')
  const [sorting, setSorting] = React.useState([]);

  const { isLoading, error, data = {data: []} } = useQuery({
    queryKey: ['data', filterFor, filterIn, pagination, sorting],
    queryFn: () => fetchFilteredAndSortedData({filterFor, filterIn, pagination, sorting}),
    placeholderData: keepPreviousData
  }); 

  useEffect(() => console.log(data), [data])

  const table = useReactTable({
    data: data.data,
    columns,
    state: {
      filterFor,
      filterIn,
      pagination,
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount: data?.totalResults,
    pageSize: pagination.pageSize,
    debugTable: true
  });

  // Custom sorting handler to avoid third sort state
  const handleSortingToggle = (header) => {
    setSorting((prevSorting) => {
      const existingSort = prevSorting.find(sort => sort.id === header.column.id);
      if (existingSort) {
        return prevSorting.map(sort =>
          sort.id === header.column.id
            ? { ...sort, desc: !sort.desc }
            : sort
        );
      } else {
        return [{ id: header.column.id, desc: false }];
      }
    });
  };

  const handleFilters = (e) => {
    e.preventDefault()
    setFilterFor(e.currentTarget.elements.filterFor.value)
    setFilterIn(e.currentTarget.elements.filterIn.value)
    setPagination({
      pageIndex: 0, 
      pageSize: pagination.pageSize
    })
  };

  const handlePageChange = (pageNum) => {
    setPagination({
      pageIndex: pageNum,
      pageSize: pagination.pageSize
    })
  }

  const loPage = (pagination.pageIndex + 1 - 5 >= 1) ? pagination.pageIndex + 1 - 5 : 1;
  const hiPage = (pagination.pageIndex + 1 + 5 <= data.totalPages) ? pagination.pageIndex + 1 + 5 : data.totalPages;
  const pageLinks = [];

  if (table.getCanPreviousPage()) {
    pageLinks.push(
      <button
        className='pager'
        onClick={() => table.firstPage()}
        disabled={pagination.pageIndex == 0}
      >
        [1]
      </button>
    )
    pageLinks.push(
      <button
        className='pager'
        onClick={() => table.previousPage()}
      >
        {'< Prev'}
      </button>
    )
  }
  
  for (let p = loPage; p <= hiPage; p++) {
    pageLinks.push(
      <button
        className='pager'
        onClick={() => handlePageChange((p) => p - 1)}
        disabled={pagination.pageIndex + 1 == p}
      >
        { p }
      </button>
    )
  }

  if (table.getCanNextPage()) {
    pageLinks.push(
      <button
        className='pager'
        onClick={() => table.nextPage()}
      >
        {'Next >'}
      </button>
    )
    pageLinks.push(
      <button
        className='pager'
        onClick={() => table.lastPage()}
        disabled={pagination.pageIndex == table.getPageCount() - 1}
      >
        { pagination.pageIndex + 1 < table.getPageCount()  ? `[${table.getPageCount()}]` : table.getPageCount() }
      </button>
    )
  }
      
  return (
    <div className='wrap'>
      <div className='header'>
        <h1>ARK Database</h1>
        <form className='filterForm' onSubmit={handleFilters}>
          <label htmlFor='filterFor'>Filter for </label>
          <input id='filterFor' type="text"/>
          <label htmlFor='filterIn'> in </label>
          <select id='filterIn'>
            <option value="ark">ARK</option>
            <option value="original_identifier">Original Identifier</option>
            <option value="project">Project</option>
          </select>
          <button type="submit">Filter Results</button> 
        </form>
        <div className="downloadAsExcel">
          <button>Download as Excel</button>
        </div>
      </div>
      <div className='body'>
        <table style={{ width: table.getTotalSize() }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th 
                    key={header.id} 
                    style={{ width: header.getSize()}}
                  >
                    <div onClick={() => handleSortingToggle(header)}>
                      {header.column.columnDef.header}
                      {header.column.getIsSorted() ? (header.column.getIsSorted() === 'asc' ? ' ↓' : ' ↑') : ''}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      { pageLinks }

      { isLoading && <p>Loading...</p> }
      { error && <p>An error occurred...</p> }
    </div>
  );
};
export default ArkTable;
