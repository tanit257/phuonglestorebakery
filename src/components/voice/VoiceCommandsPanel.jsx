import React, { useState } from 'react';
import { Mic, ChevronDown, ChevronUp, Lightbulb, Package, CreditCard, BarChart3, Plus, Search } from 'lucide-react';
import { useVoiceContext } from '../../contexts/VoiceContext';

// Sample voice commands organized by category
const SAMPLE_COMMANDS = [
    {
        category: 'Tạo đơn hàng',
        icon: Package,
        color: 'blue',
        commands: [
            { text: 'Tạo đơn cho tiệm Hồng, 5kg bột mì', desc: 'Tạo đơn với khách hàng và sản phẩm' },
            { text: 'Tạo đơn cho Anh Quân, 3kg đường, 2kg bột năng', desc: 'Nhiều sản phẩm' },
            { text: 'Đơn hàng tiệm ABC 10kg bột mì', desc: 'Cách nói khác' },
        ]
    },
    {
        category: 'Thêm sản phẩm',
        icon: Plus,
        color: 'emerald',
        commands: [
            { text: 'Thêm 5kg bột mì', desc: 'Thêm vào giỏ hàng hiện tại' },
            { text: 'Thêm bánh mỳ', desc: 'Mặc định 1 sản phẩm' },
            { text: 'Cho vào 2 hộp kem', desc: 'Cách nói khác' },
        ]
    },
    {
        category: 'Công nợ',
        icon: CreditCard,
        color: 'rose',
        commands: [
            { text: 'Xem công nợ', desc: 'Tổng công nợ tất cả' },
            { text: 'Công nợ tiệm Hồng', desc: 'Nợ của khách hàng cụ thể' },
            { text: 'Nợ tháng 1', desc: 'Lọc theo thời gian' },
        ]
    },
    {
        category: 'Báo cáo',
        icon: BarChart3,
        color: 'amber',
        commands: [
            { text: 'Báo cáo doanh thu hôm nay', desc: 'Doanh thu ngày' },
            { text: 'Doanh số tuần này', desc: 'Theo tuần' },
            { text: 'Thống kê tháng này', desc: 'Theo tháng' },
        ]
    },
    {
        category: 'Tìm kiếm',
        icon: Search,
        color: 'blue',
        commands: [
            { text: 'Giá bột mì', desc: 'Tra cứu giá sản phẩm' },
            { text: 'Tìm khách hàng tiệm ABC', desc: 'Tìm thông tin khách' },
        ]
    },
];

const getColorClasses = (color) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
        rose: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    };
    return colors[color] || colors.blue;
};

const getIconBgClasses = (color) => {
    const colors = {
        blue: 'bg-blue-500',
        emerald: 'bg-emerald-500',
        rose: 'bg-rose-500',
        amber: 'bg-amber-500',
    };
    return colors[color] || colors.blue;
};

export const VoiceCommandsPanel = ({ className = '' }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const { startListening, isSupported } = useVoiceContext();

    if (!isSupported) return null;

    return (
        <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Lightbulb size={16} className="text-white" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-gray-800 text-sm">Câu lệnh voice mẫu</h3>
                        <p className="text-xs text-gray-500">Nhấn vào để thử</p>
                    </div>
                </div>
                {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
                    {SAMPLE_COMMANDS.map((category, idx) => {
                        const Icon = category.icon;
                        const isOpen = expandedCategory === idx;

                        return (
                            <div key={idx} className="rounded-xl overflow-hidden border border-gray-100">
                                {/* Category Header */}
                                <button
                                    onClick={() => setExpandedCategory(isOpen ? null : idx)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 transition-colors ${getColorClasses(category.color)}`}
                                >
                                    <div className={`w-6 h-6 ${getIconBgClasses(category.color)} rounded-md flex items-center justify-center`}>
                                        <Icon size={14} className="text-white" />
                                    </div>
                                    <span className="font-medium text-sm flex-1 text-left">{category.category}</span>
                                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>

                                {/* Commands */}
                                {isOpen && (
                                    <div className="bg-white p-2 space-y-1.5">
                                        {category.commands.map((cmd, cmdIdx) => (
                                            <button
                                                key={cmdIdx}
                                                onClick={() => {
                                                    // Copy to clipboard and start listening
                                                    navigator.clipboard?.writeText(cmd.text);
                                                    startListening();
                                                }}
                                                className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Mic size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                                                    <p className="text-sm text-gray-800 font-medium">"{cmd.text}"</p>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-0.5 pl-6">{cmd.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Quick tip */}
                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                        <p className="text-xs text-blue-700 font-medium mb-1 flex items-center gap-1"><Lightbulb size={12} /> Mẹo:</p>
                        <p className="text-xs text-gray-600">
                            Nói rõ ràng, chậm rãi. Có thể nói số lượng bằng số hoặc chữ (5kg hoặc năm ký).
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceCommandsPanel;
