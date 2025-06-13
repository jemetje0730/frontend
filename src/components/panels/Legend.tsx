import { MOUSE_ACTIONS, KEYBOARD_ACTIONS } from '../../constants/actionColors';

const Legend = () => {
  return (
    <div style={{ padding: 10, width: 180, background: '#f9f9f9' }}>
      <h4>Actions</h4>
      {MOUSE_ACTIONS.map(({ type, color }) => (
        <div
          key={type}
          style={{
            marginBottom: 8,
            padding: 8,
            border: `2px solid ${color}`,
            borderRadius: 4,
            color,
            userSelect: 'none',
            cursor: 'default',
          }}
        >
          {type}
        </div>
      ))}

      <div style={{ marginTop: 16, fontWeight: 'bold' }}>Keyboard Actions</div>
      <ul style={{ paddingLeft: 20, marginTop: 8 }}>
        {KEYBOARD_ACTIONS.map((type) => (
          <li key={type} style={{ userSelect: 'none', cursor: 'default' }}>
            {type}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Legend;
