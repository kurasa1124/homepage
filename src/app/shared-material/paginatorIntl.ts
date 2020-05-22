import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class MatPaginatorIntlGerman extends MatPaginatorIntl {
  firstPageLabel = "第一頁";
  lastPageLabel = "最後一頁";
  nextPageLabel = '下一頁';
  previousPageLabel = '上一頁';

  getRangeLabel = (page: number, pageSize: number, length: number) => {
    return `${(page * pageSize) + 1} - ${(page * pageSize) + pageSize} 篇（共 ${length} 篇）`;
  }
}
