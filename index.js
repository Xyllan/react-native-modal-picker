'use strict';

import React,{
    PropTypes
} from 'react';

import {
    View,
    StyleSheet,
    Dimensions,
    Modal,
    Text,
    ScrollView,
    TouchableOpacity,
    Platform
} from 'react-native';

import styles from './style';
import BaseComponent from './BaseComponent';

let componentIndex = 0;

const propTypes = {
    data: PropTypes.array,
    visible: PropTypes.bool,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    initValues: PropTypes.array,
    style: View.propTypes.style,
    selectStyle: View.propTypes.style,
    optionStyle: View.propTypes.style,
    optionTextStyle: Text.propTypes.style,
    sectionStyle: View.propTypes.style,
    sectionTextStyle: Text.propTypes.style,
    submitStyle: View.propTypes.style,
    submitTextStyle: View.propTypes.style,
    cancelStyle: View.propTypes.style,
    cancelTextStyle: Text.propTypes.style,
    overlayStyle: View.propTypes.style,
    optionContainer: View.propTypes.style,
    buttonsContainer: View.propTypes.style,
    submitText: PropTypes.string,
    cancelText: PropTypes.string,
    scrollProps: PropTypes.object,
};

const defaultProps = {
    data: [[]],
    visible: false,
    onChange: () => {},
    onSubmit: () => {},
    onCancel: () => {},
    initValues: ['Select me!'],
    style: {},
    selectStyle: {},
    optionStyle: {},
    optionTextStyle: {},
    sectionStyle: {},
    sectionTextStyle: {},
    submitStyle: {},
    submitTextStyle: {},
    cancelStyle: {},
    cancelTextStyle: {},
    overlayStyle: {},
    optionContainer: {},
    buttonsContainer: {},
    submitText: 'OK',
    cancelText: 'Cancel',
    scrollProps: {
        keyboardShouldPersistTaps: 'always',
    },
};

export default class ModalPicker extends BaseComponent {

    constructor() {
        super();
        this._bind(
            'onChange',
            'open',
            'close',
            'renderChildren'
        );
        this.state = {
            animationType: 'slide',
            modalVisible: false,
            transparent: false,
            selected: [],
        };
    }

    componentDidMount() {
        const { initValues, submitText, cancelText, } = this.props;
        this.setState({
            selected: initValues,
            submitText,
            cancelText,
        });
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.initValues != this.props.initValues) {
        this.setState({
            selected: nextProps.initValues
        });
      }
    }

    onChange(item, col, row) {
        const { selected } = this.state;
        this.props.onChange(item, col, row);
        let o = {};
        o[col] = row;
        this.setState({
            selected: Object.assign([], selected, o),
        });
    }

    close() {
        this.setState({
            modalVisible: false
        });
    }

    open() {
        this.setState({
            modalVisible: true
        });
    }

    submit() {
        const { onSubmit, data } = this.props;
        const { selected, } = this.state;
        onSubmit(selected.map((val, ind) => data[ind][val]));
    }

    cancel() {
        const { onCancel } = this.props;
        onCancel();
    }

    renderSection(section, col, row) {
        return (
            <View key={section.key} style={[styles.sectionStyle,this.props.sectionStyle]}>
                <Text style={[styles.sectionTextStyle,this.props.sectionTextStyle]}>{section.label}</Text>
            </View>
        );
    }

    renderOption(option, col, row) {
        const curSelected = this.state.selected[col] == row;
        let textStyle = [styles.optionTextStyle, this.props.optionTextStyle];
        if(curSelected) textStyle = [...textStyle, styles.selectTextStyle, this.props.selectTextStyle];
        return (
            <TouchableOpacity key={col + ' ' + row} onPress={()=>this.onChange(option, col, row)}>
                <View style={[styles.optionStyle, this.props.optionStyle]}>
                    {option.component}
                    <Text style={textStyle}>{option.label}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    renderOptionList(col) {
        var options = this.props.data[col].map((item, row) => {
            if (item.section) {
                return this.renderSection(item, col, row);
            } else {
                return this.renderOption(item, col, row);
            }
        });
        return (
            <View key={col} style={{flex: 1}}>
                <ScrollView {...this.props.scrollProps}>
                    <View style={{paddingHorizontal:10}}>
                        {options}
                    </View>
                </ScrollView>
            </View>
        );
    }

    renderOptionLists() {
        const { selected } = this.state;
        return (
            <View style={[styles.overlayStyle, this.props.overlayStyle]} key={'modalPicker'+(componentIndex++)}>
                <View style={[styles.optionContainer, this.props.optionContainer]}>
                    {selected.map((item, index) => this.renderOptionList(index))}
                </View>
                <View style={[styles.buttonsContainer, this.props.buttonsContainer]}>
                    <View style={[styles.cancelStyle, this.props.cancelStyle]}>
                        <TouchableOpacity onPress={this.cancel.bind(this)}>
                            <View>
                                <Text style={[styles.cancelTextStyle, this.props.cancelTextStyle]}>{this.state.cancelText}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.submitStyle, this.props.submitStyle]}>
                        <TouchableOpacity onPress={this.submit.bind(this)}>
                            <View>
                                <Text style={[styles.submitTextStyle, this.props.submitTextStyle]}>{this.state.submitText}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    renderChildren() {
        if(this.props.children) {
            return this.props.children;
        }
        return (
            <View style={[styles.selectStyle, this.props.selectStyle]}>
                <Text style={[styles.selectTextStyle, this.props.selectTextStyle]}>{this.state.selected}</Text>
            </View>
        );
    }

    render() {
        const { visible } = this.props;
        const dp = (
            <Modal transparent={true} ref="modal" visible={visible} onRequestClose={this.cancel.bind(this)} animationType={this.state.animationType}>
                {this.renderOptionLists()}
            </Modal>
        );
        return (
            <View style={this.props.style}>
                {dp}
                <TouchableOpacity onPress={this.open}>
                    {this.renderChildren()}
                </TouchableOpacity>
            </View>
        );
    }
}

ModalPicker.propTypes = propTypes;
ModalPicker.defaultProps = defaultProps;