.repo
  width: 100%
  height: 300px
  margin: 0 0 15px 0
  position: relative
  padding: 0 0 1px 0
  color: #555
  overflow: hidden
  transition: height 0.25s
  box-sizing: border-box

  *
    box-sizing: inherit

  .loader
    position: absolute
    display: block
    width: 100%
    height: 300px
    top: 0
    left: 0

    .loaded &
      display: none

  .page
    background: #f8f8f8
    border: 1px solid #dddddd
    border-radius: 3px
    opacity: 0
    left: 100%
    width: 98%
    position: absolute
    transition: all .25s

    &.active
      left: 1% !important
      opacity: 1
      display: block

    &.left
      left: -100%

  h1
    padding: 0 0 0 10px
    font-family: sans-serif
    font-size: 20px
    line-height: 26px
    color: #000
    font-weight: normal

    a: nth-of-type(1),
    a.active
      font-weight: bold

    a.active,
    a.active:active,
    a.active:visited,
    a.active:hover
      color: #000

    a,
    a:active,
    a:visited,
    a:hover
      color: #4183c4
      text-decoration: none

    a:after
      content: '/'
      color: #999
      padding: 0 5px
      font-weight: normal

    a:last-child:after
      content: ''

  .page,
  ul
    zoom: 1

  .page:before,
  .page:after,
  ul:before,
  ul:after
    content: ''
    display: table

  .page:after,
  ul:after
    clear: both


  ul
    margin: 0
    padding: 0

    *
      display: block
      font-family: sans-serif
      font-size: 13px
      line-height: 18px

    li
      width: 100%
      margin: 0
      padding: 0
      float: left
      border-bottom: 1px solid #dddddd
      position: relative
      white-space: nowrap

    &.titles
      background: linear-gradient(top, #fafafa,#eaeaea)
      font-weight: bold
      padding: 10px 10px 8px 36px
      text-shadow: 0 1px 0 #fff

    &:before
      content: ''
      position: absolute
      width: 16px
      height: 16px
      background-image: url()
      background-size: contain
      background-repeat: no-repeat
      left: 8px
      top: 10px

    &.dir:before
      background-image: url()

    &.titles:before,
    &.back:before
      background-image: none

    &:last-child
      border: 0
      margin: 0
      padding-bottom: 0

      a,
      a:visited,
      a:active
        color: #4183c4
        width: 100%
        padding: 10px 10px 8px 36px
        display: block
        text-decoration: none

      a:hover
        text-decoration: underline

      span
        display: inline-block

      span:nth-of-type(1)
        width: 30%

      span:nth-of-type(2)
        width: 20%

      span:nth-of-type(3)
        width: 40%
