var PropTypes = require('prop-types');
var React = require('react');
var createReactClass = require('create-react-class');
var transitionEvents = require('react-kit/transitionEvents');
var ReactDOM = require('react-dom');

module.exports = function(animation){

    return createReactClass({
        propTypes: {
            className: PropTypes.string,
            // Close the modal when esc is pressed? Defaults to true.
            keyboard: PropTypes.bool,
            onShow: PropTypes.func,
            onHide: PropTypes.func,
            animation: PropTypes.object,
            backdrop: PropTypes.oneOfType([
                PropTypes.bool,
                PropTypes.string
            ])
        },

        getDefaultProps: function() {
            return {
                className: "",
                onShow: function(){},
                onHide: function(){},
                animation: animation,
                keyboard: true,
                backdrop: true
            };
        },

        getInitialState: function(){
            return {
                willHidden: false,
                hidden: true
            }
        },

        hasHidden: function(){
            return this.state.hidden;
        },

        componentDidMount: function(){
            var ref = this.props.animation.getRef();
            var node = ReactDOM.findDOMNode(this.refs[ref]);
            var endListener = function(e) {
                if (e && e.target !== node) {
                    return;
                }
                transitionEvents.removeEndEventListener(node, endListener);
                this.enter();

            }.bind(this);
            transitionEvents.addEndEventListener(node, endListener);
        },

        render: function() {

            var hidden = this.hasHidden();
            if(hidden) return null;

            var willHidden = this.state.willHidden;
            var animation = this.props.animation;
            var modalStyle = animation.getModalStyle(willHidden);
            var backdropStyle = animation.getBackdropStyle(willHidden);
            var contentStyle = animation.getContentStyle(willHidden);
            var ref = animation.getRef(willHidden);
            var sharp = animation.getSharp && animation.getSharp(willHidden);
            var backdrop = this.props.backdrop? React.createElement("div", {onClick: this.hide, style: backdropStyle}): undefined;

            if (this.props.customStyle) {
                for (var style in this.props.customStyle) {
                    modalStyle[style] = this.props.customStyle[style];
                };
            }

            if(willHidden) {
                var node = ReactDOM.findDOMNode(this.refs[ref]);
                var endListener = function(e) {
                    if (e && e.target !== node) {
                        return;
                    }

                    transitionEvents.removeEndEventListener(node, endListener);
                    this.leave();

                }.bind(this);
                transitionEvents.addEndEventListener(node, endListener);
            }

            return (React.createElement("span", null,
                React.createElement("div", {ref: "modal", style: modalStyle, className: this.props.className},
                    sharp,
                    React.createElement("div", {ref: "content", tabIndex: "-1", style: contentStyle},
                        this.props.children
                    )
                ),
                backdrop
             ))
            ;
        },

        leave: function(){
            this.setState({
                hidden: true
            });
            this.props.onHide();
        },

        enter: function(){
            this.props.onShow();
        },

        show: function(){
            if(!this.hasHidden()) return;

            this.setState({
                willHidden: false,
                hidden: false
            });
        },

        hide: function(){
            if(this.hasHidden()) return;

            this.setState({
                willHidden: true
            });
        },

        toggle: function(){
            if(this.hasHidden())
                this.show();
            else
                this.hide();
        },

        listenKeyboard: function(event) {
            if (this.props.keyboard &&
                    (event.key === "Escape" ||
                     event.keyCode === 27)) {
                this.hide();
            }
        },

        componentDidMount: function() {
            window.addEventListener("keydown", this.listenKeyboard, true);
        },

        componentWillUnmount: function() {
            window.removeEventListener("keydown", this.listenKeyboard, true);
        },

    });

}