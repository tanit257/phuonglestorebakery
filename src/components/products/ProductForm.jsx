import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { PRODUCT_UNITS, BULK_UNITS } from '../../utils/constants';

export const ProductForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    invoice_name: '',
    product_code: '',
    unit: 'kg',
    price: '',
    invoice_price: '',
    stock: '',
    bulk_unit: '',
    bulk_quantity: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        invoice_name: formData.invoice_name?.trim() || null,
        product_code: formData.product_code?.trim() || null,
        price: Number(formData.price),
        invoice_price: Number(formData.invoice_price) || Math.round(Number(formData.price) * 0.8),
        stock: Number(formData.stock) || 0,
        bulk_unit: formData.bulk_unit || null,
        bulk_quantity: formData.bulk_quantity ? Number(formData.bulk_quantity) : null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder="Tên sản phẩm *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Input
          placeholder="Để trống = dùng tên sản phẩm"
          value={formData.invoice_name}
          onChange={(e) => setFormData({ ...formData, invoice_name: e.target.value })}
          label="Tên hàng hóa đơn"
        />

        <Input
          placeholder="VD: SP001"
          value={formData.product_code}
          onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
          label="Mã hàng hóa"
        />

        <Select
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          options={PRODUCT_UNITS}
          label="Đơn vị tính"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            placeholder="Giá bán thực tế (VNĐ) *"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            label="Giá thực tế"
          />
          <Input
            type="number"
            placeholder="Giá hóa đơn (VNĐ)"
            value={formData.invoice_price}
            onChange={(e) => setFormData({ ...formData, invoice_price: e.target.value })}
            label="Giá hóa đơn"
          />
        </div>

        <Input
          type="number"
          placeholder="Tồn kho thực tế"
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
          label="Tồn kho thực tế"
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            value={formData.bulk_unit}
            onChange={(e) => setFormData({ ...formData, bulk_unit: e.target.value, bulk_quantity: e.target.value ? formData.bulk_quantity : '' })}
            options={BULK_UNITS}
            label="Đơn vị lớn"
          />
          <Input
            type="number"
            placeholder="VD: 20"
            value={formData.bulk_quantity}
            onChange={(e) => setFormData({ ...formData, bulk_quantity: e.target.value })}
            label="SL/đơn vị lớn"
            disabled={!formData.bulk_unit}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" fullWidth icon={Plus} disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : (initialData ? 'Cập nhật' : 'Thêm sản phẩm')}
          </Button>
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
              <X size={20} />
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default ProductForm;
