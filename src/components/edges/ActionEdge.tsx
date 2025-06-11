import React from 'react';
import {
  BaseEdge,
  getBezierPath,
  EdgeLabelRenderer,
  type EdgeProps
} from 'reactflow';
import { ACTION_COLORS } from '../../constants/actionColors';

const ActionEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY });
  const action = data?.action || 'click';
  const position = data?.position || null; // string | number[]
  const color = ACTION_COLORS[action] || 'black';
  const markerId = `arrow-${action}`;

  let positionText = '';
  if (action !== 'next' && position) {
    if (Array.isArray(position) && position.length === 2) {
      positionText = ` (${position[0]}, ${position[1]})`;
    } else if (typeof position === 'string') {
      positionText = ` (${position})`;
    }
  }

  return (
    <>
      <svg style={{ height: 0 }}>
        <defs>
          {Object.entries(ACTION_COLORS).map(([actionName, actionColor]) => (
            <marker
              key={actionName}
              id={`arrow-${actionName}`}
              viewBox="0 0 10 10"
              refX={10}
              refY={5}
              markerWidth={6}
              markerHeight={6}
              orient="auto-start-reverse"
              fill={actionColor}
            >
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          ))}
        </defs>
      </svg>

      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={`url(#${markerId})`}
        style={{ stroke: color, strokeWidth: 2 }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            fontSize: 10,
            padding: '2px 4px',
            background: 'white',
            border: `1px solid ${color}`,
            borderRadius: 4,
            color: color,
            whiteSpace: 'nowrap',
          }}
        >
          {action + positionText}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default ActionEdge;