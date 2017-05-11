
export default class TableModel {
  columns: any[];
  rows: any[];
  thresholdCountPerRow: any[];
  type: string;

  constructor() {
    this.columns = [];
    this.rows = [];
    this.thresholdCountPerRow = [];
    this.type = 'table';
  }

  sort(options) {
    if (options.col === null || this.columns.length <= options.col) {
      return;
    }

    this.rows.sort(function(a, b) {
      a = a[options.col];
      b = b[options.col];
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    });

    this.columns[options.col].sort = true;

    if (options.desc) {
      this.rows.reverse();
      this.columns[options.col].desc = true;
    } else {
      this.columns[options.col].desc = false;
    }
  }

  sortByThresholds(options) {
    if (options.col === null) {
      return;
    }

    var thresholdCountPerRow = this.thresholdCountPerRow;
    var rows = this.rows;
    this.rows.sort(function(a, b) {
      a = thresholdCountPerRow[a[0]];
      b = thresholdCountPerRow[b[0]];

      a = a[0];
      b = b[0];
      if (a === b) {
        a = a[1];
        b = b[1];
      }

      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    });


    this.columns[options.col].sort = true;

    if (options.desc) {
      this.rows.reverse();
      this.columns[options.col].desc = true;
    } else {
      this.columns[options.col].desc = false;
    }
  }
}
