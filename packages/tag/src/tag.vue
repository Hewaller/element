<script>
export default {
  name: 'ElTag',
  props: {
    text: String,
    closable: Boolean,  // 是否能关闭
    type: String,
    hit: Boolean,  // 边框
    disableTransitions: Boolean,  // 
    color: String,
    size: String
  },
  methods: {
    handleClose(event) {
      event.stopPropagation();
      this.$emit('close', event);
    },
    handleClick(event) {
      event.stopPropagation();
      this.$emit('click', event);
    }
  },
  computed: {
    tagSize() {
      return this.size || (this.$ELEMENT || {}).size;
    }
  },
  render(h) {
    const classes = ['el-tag', this.type ? `el-tag--${this.type}` : '',
      this.tagSize ? `el-tag--${this.tagSize}` : '',
      { 'is-hit': this.hit }
    ];
    const tagEl = (<span class={classes} style={{ backgroundColor: this.color }} on-click={this.handleClick}>
      {this.$slots.default}
      {
        this.closable && <i class="el-tag__close el-icon-close" on-click={this.handleClose}></i>
      }
    </span>);

    return this.disableTransitions ? tagEl : <transition name="el-zoom-in-center">{tagEl}</transition>;
  }
};
</script>
