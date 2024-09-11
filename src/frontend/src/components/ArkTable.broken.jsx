import React, { useMemo, useRef, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Cell from "./Cell";

const columns = [
  {
    accessorKey: "ark",
    cell: Cell,
    enableFiltering: true,
    enableResizing: true,
    enableSorting: true,
    filterFn: "includesString",
    header: "ARK",
    minSize: 10,
    size: 150,
  },
  {
    accessorKey: "original_identifier",
    cell: Cell,
    enableFiltering: true,
    enableResizing: true,
    enableSorting: true,
    filterFn: "includesString",
    header: "Original Identifier",
    minSize: 10,
    size: 150,
  },
  {
    accessorKey: "project",
    cell: Cell,
    enableFiltering: true,
    enableResizing: true,
    enableSorting: true,
    filterFn: "includesString",
    header: "Project",
    minSize: 10,
    size: 150,
  },
  {
    accessorKey: "path",
    cell: Cell,
    enableFiltering: true,
    enableResizing: false,
    enableSorting: true,
    filterFn: "includesString",
    header: "Path",
    minSize: 10,
    size: 150,
  },
];

const fetchFilteredAndSortedData = async ({ filterFor, filterIn, sorting }) => {
  console.log('in fetchFilteredAndSortedData')
  let params = {}
  if (filterFor && filterIn) {
    params[filterIn] = filterFor
  }
  if (sorting.length) {
    params['sortBy'] = sorting[0].id
    params['order'] = sorting[0].desc ? 'desc' : 'asc'
  }
  let url;
  if (Object.keys(params).length) {
    url = 'http://127.0.0.1:5000/data?' + new URLSearchParams(params).toString()
  } else {
    url = 'http://127.0.0.1:5000/data'
  }
  console.log(url)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Response error')
  }
  return response.json()
}

const ArkTable = () => {
  const [columnSizing, setColumnSizing] = useState([])
  const [filterFor, setFilterFor] = useState('')
  const [filterIn, setFilterIn] = useState('')
  //const [page, setPage] = useState(1)
  //const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] = React.useState([])

  const { isLoading, error, data = [] } = useQuery({
    queryKey: ['data', filterFor, filterIn, sorting],
    queryFn: () => fetchFilteredAndSortedData({filterFor, filterIn, sorting}),
    placeholderData: keepPreviousData
  }); 

  const table = useReactTable({
    data,
    columns,
    state: {
      columnSizing,
      filterFor,
      filterIn,
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualSorting: true,
    onColumnSizingChange: setColumnSizing,
    onSortingChange: setSorting,
    columnResizeMode: 'onChange',
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
  };

  return (
    <div className='wrap'>
      <div className='header'>
        <h1>OCFLDB</h1>
        <form onSubmit={handleFilters}>
          <label htmlFor='filterFor'>Filter for </label>
          <input id='filterFor' type="text"/>
          <label htmlFor='filterIn'> in </label>
          <select id='filterIn'>
            <option value="ark">ARK</option>
            <option value="original_identifier">Original Identifier</option>
            <option value="project">Project</option>
            <option value="path">Path</option>
          </select>
          <button type="submit">Filter Results</button> 
        </form>
        <button>Download as Excel</button>
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
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`resizer ${
                            header.column.getIsResizing() ? "isResizing" : ""
                          }`}
                        />
                      )}
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
      <div className='footer'>
        Page {table.getState().pagination.pageIndex + 1} of{" "}
        {table.getPageCount()}
      </div>
      <div>
        <button
          onClick={() => table.previousPage()}
        >
          {"<"}
        </button>
        <button
          onClick={() => table.nextPage()}
        >
          {">"}
        </button>
      </div>
      { isLoading && <p>Loading...</p> }
      { error && <p>An error occurred...</p> }
    </div>
  );
};
export default ArkTable;
