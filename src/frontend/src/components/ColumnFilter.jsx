import React from 'react';

const ColumnFilter = ({ header }) => {
  return (
    <input 
      onChange={e => {
        header.column.setFilterValue({
          id: header.column.id,
          value: e.target.value
        });
        console.log(header.column.getFilterValue());
      }}
      value={header.column.getFilterValue()?.value || ''}
    />
  )
}
export default ColumnFilter;
