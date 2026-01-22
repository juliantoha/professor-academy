import React, { useState, ReactNode } from 'react';
import { colors, shadows, borderRadius, transitions, fonts } from '../styles/oclefDesignSystem';

export interface TableRowAction {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success' | 'warning';
}

export interface TableRowProps {
  children: ReactNode;
  onClick?: () => void;
  actions?: TableRowAction[];
  isClickable?: boolean;
  isSelected?: boolean;
  isStriped?: boolean;
  stripedIndex?: number;
}

const TableRow: React.FC<TableRowProps> = ({
  children,
  onClick,
  actions = [],
  isClickable = false,
  isSelected = false,
  isStriped = false,
  stripedIndex = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getVariantColors = (variant: TableRowAction['variant'] = 'default') => {
    switch (variant) {
      case 'danger':
        return {
          bg: colors.alertRedBg,
          color: colors.alertRed,
          hoverBg: colors.alertRed,
        };
      case 'success':
        return {
          bg: colors.successGreenBg,
          color: colors.successGreen,
          hoverBg: colors.successGreen,
        };
      case 'warning':
        return {
          bg: colors.warningAmberBg,
          color: colors.warningAmber,
          hoverBg: colors.warningAmber,
        };
      default:
        return {
          bg: colors.oclefBlueLight,
          color: colors.oclefBlue,
          hoverBg: colors.oclefBlue,
        };
    }
  };

  const getBackgroundColor = () => {
    if (isSelected) return `${colors.oclefBlue}15`;
    if (isHovered) return `${colors.oclefBlue}08`;
    if (isStriped && stripedIndex % 2 === 1) return '#F9FAFB';
    return 'transparent';
  };

  return (
    <tr
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isClickable ? onClick : undefined}
      style={{
        backgroundColor: getBackgroundColor(),
        transition: `all ${transitions.smooth}`,
        cursor: isClickable ? 'pointer' : 'default',
        position: 'relative',
        borderLeft: isSelected ? `3px solid ${colors.oclefBlue}` : '3px solid transparent',
      }}
    >
      {children}

      {/* Reveal Actions Column */}
      {actions.length > 0 && (
        <td
          style={{
            padding: '12px 16px',
            textAlign: 'right',
            whiteSpace: 'nowrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateX(0)' : 'translateX(10px)',
              transition: `all ${transitions.smooth}`,
              pointerEvents: isHovered ? 'auto' : 'none',
            }}
          >
            {actions.map((action, index) => {
              const variantColors = getVariantColors(action.variant);
              const [isActionHovered, setIsActionHovered] = useState(false);

              return (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                  onMouseEnter={() => setIsActionHovered(true)}
                  onMouseLeave={() => setIsActionHovered(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: fonts.body,
                    color: isActionHovered ? colors.white : variantColors.color,
                    backgroundColor: isActionHovered ? variantColors.hoverBg : variantColors.bg,
                    border: 'none',
                    borderRadius: borderRadius.sm,
                    cursor: 'pointer',
                    transition: `all ${transitions.fast}`,
                    transform: isActionHovered ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isActionHovered ? shadows.medium : 'none',
                  }}
                  title={action.label}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </td>
      )}
    </tr>
  );
};

// Table Cell Component for consistent styling
export interface TableCellProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  isHeader?: boolean;
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  align = 'left',
  width,
  isHeader = false,
  sortable = false,
  sorted = null,
  onSort,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const Tag = isHeader ? 'th' : 'td';

  return (
    <Tag
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={sortable && onSort ? onSort : undefined}
      style={{
        padding: isHeader ? '14px 16px' : '16px',
        textAlign: align,
        width: width,
        fontFamily: fonts.body,
        fontSize: isHeader ? '13px' : '14px',
        fontWeight: isHeader ? 600 : 400,
        color: isHeader ? colors.textSecondary : colors.tangaroa,
        backgroundColor: isHeader ? '#F9FAFB' : 'transparent',
        borderBottom: `1px solid ${colors.borderLight}`,
        cursor: sortable ? 'pointer' : 'default',
        userSelect: sortable ? 'none' : 'auto',
        transition: `background-color ${transitions.fast}`,
        ...(sortable && isHovered && isHeader
          ? { backgroundColor: '#F3F4F6' }
          : {}),
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        }}
      >
        {children}
        {sortable && isHeader && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={sorted ? colors.oclefBlue : colors.textTertiary}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              opacity: sorted || isHovered ? 1 : 0.5,
              transform: sorted === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: `all ${transitions.fast}`,
            }}
          >
            <path d="M12 5v14M19 12l-7-7-7 7" />
          </svg>
        )}
      </div>
    </Tag>
  );
};

// Table Wrapper for consistent table styling
export interface TableWrapperProps {
  children: ReactNode;
}

export const TableWrapper: React.FC<TableWrapperProps> = ({ children }) => {
  return (
    <div
      style={{
        overflowX: 'auto',
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.borderLight}`,
        backgroundColor: colors.white,
        boxShadow: shadows.subtle,
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: fonts.body,
        }}
      >
        {children}
      </table>
    </div>
  );
};

export default TableRow;
