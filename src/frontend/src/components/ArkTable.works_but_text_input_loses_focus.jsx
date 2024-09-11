import React, { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

const fetchFilteredAndSortedData = async ({ filters, sorting }) => {
  const filterParams = filters.map(filter => `${filter.id}=${filter.value}`).join('&');
  const sortParams = sorting.map(sort => `sortBy=${sort.id}&order=${sort.desc ? 'desc' : 'asc'}`).join('&');
  const url = `http://127.0.0.1:5000/data?${filterParams}&${sortParams}`;
  const response = await fetch(url);
  return response.json();
}

const ArkTable = () => {
  const [columnSizing, setColumnSizing] = useState([]);
  const [filters, setFilters] = useState([])
  const [sorting, setSorting] = React.useState([]);

  const { isPending, error, data = [] } = useQuery({
    queryKey: ['data', filters, sorting],
    queryFn: () => fetchFilteredAndSortedData({filters, sorting}),
  }); 

  const table = useReactTable({
    data,
    columns,
    state: {
      columnSizing,
      filters,
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualSorting: true,
    onColumnSizingChange: setColumnSizing,
    onFilteringChange: setFilters,
    onSortingChange: setSorting,
    columnResizeMode: "onChange",
    debugTable: true
  });

  if (isPending) {
    return "Loading...";
  }

  if (error) {
    return "An error occurred...";
  }

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

  // I want to filter exactly one thing. 
  // how to get the value from here? 
  const handleFilters = (header, e) => {
    header.column.setFilterValue(e.target.value);
    setFilters(() => {
      return [{ id: header.column.id, value: e.target.value }];
    });
  };
/*
*/

  return (
    <div className='wrap'>
      <div className='header'>
        <h1>OCFLDB</h1>
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
                    {header.column.getCanFilter() && (
                      <input 
                        onChange={e => handleFilters(header, e)}
                        value={header.column.getFilterValue() || ''}
                      />
                    )}
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
    </div>
  );
};
export default ArkTable;
