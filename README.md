# babel-plugin-css-to-js

Babel plugin for converting CSS template literals into JavaScript object literals

### Install
```sh
npm i babel-plugin-css-to-js --save-dev
```

**Before:**
```javascript
const rule = props => css`
  font-size: ${props.fontSize}px;
  margin-top: ${props.margin ? '15px' : 0};
  color: red;
  line-height: 1.4;
  :hover {
    color: blue;
    fontSize: ${props.fontSize + 2}px
  }
  @media (min-height: 300px) {
    background-color: gray;
    :hover {
      color: black;
    }
  }
`
```

**After:**
```javascript
const rule = props => ({
  fontSize: props.fontSize + 'px',
  marginTop: props.margin ? '15px' : 0,
  color: 'red',
  lineHeight: 1.4,
  ':hover': {
    color: 'blue',
    fontSize: props.fontSize + 2 + 'px'
  },
  '@media (min-height: 300px)': {
    backgroundColor: 'gray',
    ':hover': {
      color: 'black'
    }
  }
})
```

**.babelrc**
```
{
  "plugins": [["css-to-js", {
    "plugins": ["autoprefixer"]
  }]]
}
```


