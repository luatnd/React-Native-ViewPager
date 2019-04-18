/**
 * Created by tangzhibin on 16/2/28.
 */

'use strict'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, ViewPropTypes, Text, TouchableOpacity,ScrollView ,Dimensions} from 'react-native'
import IndicatorViewPager from '../IndicatorViewPager'

const itemLayoutInfo = [];
const screenWidth = Dimensions.get('window').width;

const FORWARD = 1;
const NONE = 0;
const BACKWARD = -1;
const DEFAULT_ITEM_MARGIN = 20;

export default class PagerTitleIndicator extends Component {
    static propTypes = {
        ...ViewPropTypes,
        initialPage: PropTypes.number,
        pager: PropTypes.instanceOf(IndicatorViewPager),
        titles: PropTypes.arrayOf(PropTypes.string).isRequired,
        itemStyle: ViewPropTypes.style,
        selectedItemStyle: ViewPropTypes.style,
        itemTextStyle: Text.propTypes.style,
        trackScroll:PropTypes.bool,
        selectedItemTextStyle: Text.propTypes.style,
        selectedBorderStyle: ViewPropTypes.style,
        renderTitle: PropTypes.func
    }

    static defaultProps = {
        titles: [],
        initialPage: 0
    }

    state = {
        selectedIndex: this.props.initialPage
    }

    constructor(props) {
        super(props);
        this._preSelectedIndex = props.initialPage;
        this._visibleOffsetLeft = 0;
        this._visibleOffsetRight = screenWidth;
        this._scrollerWidth = -1;
        this._titleCount = props.titles.length || 0;
    }

    shouldComponentUpdate (nextProps, nextState) {
        return this.state.selectedIndex != nextState.selectedIndex ||
            this.props.titles + '' != nextProps.titles + '' ||
            this.props.style != nextProps.style ||
            this.props.itemStyle != nextProps.itemStyle ||
            this.props.itemTextStyle != nextProps.itemTextStyle ||
            this.props.selectedItemTextStyle != nextProps.selectedItemTextStyle ||
            this.props.selectedBorderStyle != nextProps.selectedBorderStyle
    }
    componentWillReceiveProps(nextProps){
        this._titleCount = nextProps.titles.length;
    }

    render () {
        let {titles, pager, itemStyle, selectedItemStyle, itemTextStyle, selectedItemTextStyle, selectedBorderStyle} = this.props
        if (!titles || titles.length === 0)return null

        let titleViews = titles.map((title, index) => {
            let isSelected = this.state.selectedIndex === index

            const itemMargin = (itemStyle && itemStyle.marginLeft) || DEFAULT_ITEM_MARGIN;
            let itemMarginObj = null;
            if (!itemStyle && !selectedItemStyle) {
                itemMarginObj =
                    index < this._titleCount - 1
                    ? { marginLeft: itemMargin }
                    : { marginLeft: itemMargin, marginRight: itemMargin };
            }

            const titleView = this.props.renderTitle ? this.props.renderTitle(index, title, isSelected) : (
                <Text style={isSelected ? [styles.titleTextSelected, selectedItemTextStyle] : [styles.titleText, itemTextStyle]} >
                    {title}
                </Text>
            )

            return (
                <TouchableOpacity
                    style={[styles.titleContainer, itemMarginObj, isSelected ? selectedItemStyle : itemStyle]}
                    activeOpacity={0.6}
                    key={index}
                    onLayout={e => {
                        itemLayoutInfo[index] = e.nativeEvent;
                    }}
                    onPress={() => {
                        if(this.props.trackScroll === true){
                            this._visibleDetect(index);
                        }
                        !isSelected && pager.setPage(index)}
                    }
                >
                    {titleView}
                    {isSelected ? <View style={[styles.selectedBorder, selectedBorderStyle]} /> : null}
                </TouchableOpacity>
            )
        })
        return (
            <View style={[styles.indicatorContainer, this.props.style]} >
                 <ScrollView
                    scrollEventThrottle={1}
                    onScroll={e => {
                        this._visibleOffsetLeft = e.nativeEvent.contentOffset.x;
                        this._visibleOffsetRight = screenWidth + this._visibleOffsetLeft;
                    }}
                    showsHorizontalScrollIndicator={false}
                    ref={c => {
                        this.scroller = c;
                        window.tmp_scroller = c;
                    }}
                    horizontal={true}
                    style={{ flex: 1 }}
                    >
                    {titleViews}
                </ScrollView>
            </View>
        )
    }

    _visibleDetect(selectedIndex) {
        if(selectedIndex > this._titleCount -1 ) return ;

        const curItemLayoutInfo = itemLayoutInfo[selectedIndex];
        // console.log('{_visibleDetect} itemLayoutInfo: ', itemLayoutInfo);

        if (!curItemLayoutInfo) {
          return;
        }

        if (this._scrollerWidth < 0) {
          // calculate scroller width
          const tailItem = itemLayoutInfo[itemLayoutInfo.length - 1];
          this._scrollerWidth = tailItem.layout.width + tailItem.layout.x;
          // console.log('{_visibleDetect} _scrollerWitdh: ', this._scrollerWidth);
        }

        // scroll to current item
        const { width: currItemWidth, x: curItemOffsetX } = curItemLayoutInfo.layout;
        let newPos = curItemOffsetX - (screenWidth - currItemWidth) / 2;
        const minPos = 0;
        const maxPos = this._scrollerWidth - screenWidth;

        if (newPos < minPos) newPos = minPos;
        if (newPos > maxPos) newPos = maxPos;
        this.scroller.scrollTo({ x: newPos });
    }

    onPageSelected (e) {
        if(this.props.trackScroll === true){
            this._visibleDetect(e.position);
        }
        this._preSelectedIndex = e.position;
        this.setState({selectedIndex: e.position})
    }
}

const styles = StyleSheet.create({
    indicatorContainer: {
        height: 40,
        flexDirection: 'row',
        backgroundColor: '#F6F6F6'
    },
    titleText: {
        color: '#333333',
        fontSize: 15
    },
    titleTextSelected: {
        color: '#FF7200',
        fontSize: 15
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    selectedBorder: {
        backgroundColor: '#FF7200',
        height: 2,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0
    }
})
