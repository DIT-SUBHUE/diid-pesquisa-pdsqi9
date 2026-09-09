/**
 * Auto-init DataTables for any <table data-dt>.
 *
 * Attributes:
 *   data-dt                  — enable DataTables
 *   data-dt-no-search        — disable DT search box (server-side filtering)
 *   data-dt-no-paging        — disable DT pagination (server-side pagination)
 *   data-dt-no-info          — hide record count info
 *   data-dt-page-len="N"    — rows per page (default: 25)
 */
(function () {
    var PT_BR = {
        search: 'Buscar:',
        lengthMenu: 'Mostrar _MENU_ por página',
        info: 'Exibindo _START_–_END_ de _TOTAL_ registros',
        infoEmpty: 'Nenhum registro encontrado',
        infoFiltered: '(filtrado de _MAX_ registros)',
        zeroRecords: 'Nenhum registro encontrado',
        emptyTable: 'Nenhum registro disponível',
        paginate: {
            first: 'Primeira',
            previous: 'Anterior',
            next: 'Próxima',
            last: 'Última',
        },
    };

    function initTable(table) {
        if (DataTable.isDataTable(table)) return;
        var noSearch = table.hasAttribute('data-dt-no-search');
        var noPaging = table.hasAttribute('data-dt-no-paging');
        var noInfo   = table.hasAttribute('data-dt-no-info');
        var pageLen  = parseInt(table.getAttribute('data-dt-page-len') || '25', 10);

        var hiddenColumns = Array.from(table.querySelectorAll('thead th[data-dt-hidden]'))
            .map(function (heading) { return heading.cellIndex; });
        var notOrderableColumns = Array.from(table.querySelectorAll('thead th[data-orderable="false"]'))
            .map(function (heading) { return heading.cellIndex; });
        var columnDefs = [];
        if (hiddenColumns.length) {
            columnDefs.push({ targets: hiddenColumns, visible: false, searchable: true });
        }
        if (notOrderableColumns.length) {
            columnDefs.push({ targets: notOrderableColumns, orderable: false });
        }

        var api = new DataTable(table, {
            language: PT_BR,
            ...(table.hasAttribute('data-dt-compact') ? {
                layout: { topStart: null, topEnd: null, bottomStart: null, bottomEnd: null },
                autoWidth: false,
            } : {}),
            searching: !noSearch,
            paging:    !noPaging,
            info:      !noInfo,
            pageLength: pageLen,
            ordering:  true,
			columnDefs: columnDefs,
        });

		table.dispatchEvent(new CustomEvent('diid:datatable-ready', {
			detail: { table: table, api: api },
			bubbles: true,
		}));
    }

    document.addEventListener('diid:init-datatables', function (event) {
        event.target.querySelectorAll('[data-dt]').forEach(initTable);
    });

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('[data-dt]').forEach(initTable);
    });
})();
