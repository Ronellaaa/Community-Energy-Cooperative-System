import React from "react";

export default function FinanceTable({ columns, rows, emptyText = "No records found." }) {
  if (!rows.length) {
    return <div className="fp-empty">{emptyText}</div>;
  }

  return (
    <div className="fp-table-wrap">
      <table className="fp-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id || row.id}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row) : row[column.key] || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
