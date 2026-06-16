const React = require('react');
const handler = {
  get: (_target, prop) => {
    const Icon = (props) => React.createElement('svg', { 'data-testid': prop, ...props });
    Icon.displayName = prop;
    return Icon;
  },
};
module.exports = new Proxy({}, handler);
