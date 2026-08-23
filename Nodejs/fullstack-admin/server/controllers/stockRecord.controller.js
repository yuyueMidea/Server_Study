import { StockRecordService } from '../services/stockRecord.service.js';
import { success, paginated } from '../utils/response.js';

export const StockRecordController = {
  async list(request, reply) {
    const { list, page, pageSize, total } = StockRecordService.list(request.query);
    return reply.send(success(paginated(list, { page, pageSize, total })));
  },

  async create(request, reply) {
    const record = StockRecordService.create(request.body);
    return reply.code(201).send(success(record, '登记成功'));
  },

  async reasons(request, reply) {
    return reply.send(success(StockRecordService.reasons()));
  },
};

export default StockRecordController;
