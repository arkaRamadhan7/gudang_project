'use client';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {string} email
 * @property {number} no_hp
 * @property {string} role
 */

/**
 * @param {{
 *   data: User[],
 *   loading: boolean,
 *   onEdit: (user: User) => void,
 *   onDelete: (user: User) => void
 * }} props
 */
const UserTable = ({ data = [], loading = false, onEdit, onDelete }) => {
    return (
        <DataTable
            size="small"
            className="text-sm"
            value={data}
            paginator
            rows={10}
            loading={loading}
            scrollable
            emptyMessage="Tidak ada data user"
        >
            <Column field="username" header="Username" filter />
            <Column field="email" header="Email" filter />
            <Column field="no_hp" header="No HP" filter />
            <Column field="role" header="Role" />
            <Column
                header="Aksi"
                body={(row) => (
                    <div className="flex gap-2">
                        <Button
                            icon="pi pi-pencil"
                            className="text-sm"
                            size="small"
                            severity="warning"
                            onClick={() => onEdit?.(row)}
                        />
                        <Button
                            icon="pi pi-trash"
                            className="text-sm"
                            size="small"
                            severity="danger"
                            onClick={() => onDelete?.(row)}
                        />
                    </div>
                )}
                style={{ width: '150px' }}
            />
        </DataTable>
    );
};

export default UserTable;
