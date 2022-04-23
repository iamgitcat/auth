import NavigationButton, {
    SCROLL_DIRECTION,
} from 'components/NavigationButton';
import React, { useEffect, useRef, useState } from 'react';
import { Collection, CollectionSummaries } from 'types/collection';
import constants from 'utils/strings/constants';
import { ALL_SECTION } from 'constants/collection';
import { Link, Typography } from '@mui/material';
import {
    Hider,
    CollectionBarWrapper,
    CollectionWithNavigationContainer,
    ScrollContainer,
    TwoScreenSpacedOptionsWithBodyPadding,
    CollectionTile,
} from 'components/collection';
import CollectionCardWithActiveIndicator from 'components/collection/CollectionCardWithActiveIndicator';
import styled from 'styled-components';

interface IProps {
    collections: Collection[];
    activeCollection?: number;
    setActiveCollection: (id?: number) => void;
    isInSearchMode: boolean;
    collectionSummaries: CollectionSummaries;
    showAllCollections: () => void;
    showCreateCollectionModal: (collectionName: string) => void;
}

const CollectionTitleWithDashedBorder = styled(CollectionTile)`
    border: 1px dashed ${({ theme }) => theme.palette.grey.A200};
`;
export const CreateNewCollectionTile = (props) => {
    return (
        <CollectionTitleWithDashedBorder {...props}>
            <div>{constants.NEW} </div>
            <div>{'+'}</div>
        </CollectionTitleWithDashedBorder>
    );
};

export default function CollectionBar(props: IProps) {
    const {
        activeCollection,
        collections,
        setActiveCollection,
        collectionSummaries,
        showAllCollections,
        showCreateCollectionModal,
    } = props;
    const collectionWrapperRef = useRef<HTMLDivElement>(null);
    const collectionChipsRef = props.collections.reduce(
        (refMap, collection) => {
            refMap[collection.id] = React.createRef();
            return refMap;
        },
        {}
    );

    const [scrollObj, setScrollObj] = useState<{
        scrollLeft?: number;
        scrollWidth?: number;
        clientWidth?: number;
    }>({});

    const updateScrollObj = () => {
        if (collectionWrapperRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } =
                collectionWrapperRef.current;
            setScrollObj({ scrollLeft, scrollWidth, clientWidth });
        }
    };

    useEffect(() => {
        updateScrollObj();
    }, [collectionWrapperRef.current, props.isInSearchMode, collections]);

    useEffect(() => {
        if (!collectionWrapperRef?.current) {
            return;
        }
        collectionWrapperRef.current.scrollLeft = 0;
    }, [collections]);

    useEffect(() => {
        collectionChipsRef[activeCollection]?.current.scrollIntoView({
            inline: 'center',
        });
    }, [activeCollection]);

    const clickHandler = (collectionID?: number) => () => {
        setActiveCollection(collectionID ?? ALL_SECTION);
    };

    const scrollCollection = (direction: SCROLL_DIRECTION) => () => {
        collectionWrapperRef.current.scrollBy(250 * direction, 0);
    };

    return (
        <Hider hide={props.isInSearchMode}>
            <TwoScreenSpacedOptionsWithBodyPadding>
                <Typography>{constants.ALBUMS}</Typography>
                {scrollObj.scrollWidth > scrollObj.clientWidth && (
                    <Link component="button" onClick={showAllCollections}>
                        {constants.VIEW_ALL_ALBUMS}
                    </Link>
                )}
            </TwoScreenSpacedOptionsWithBodyPadding>
            <CollectionBarWrapper>
                <CollectionWithNavigationContainer>
                    {scrollObj.scrollLeft > 0 && (
                        <NavigationButton
                            scrollDirection={SCROLL_DIRECTION.LEFT}
                            onClick={scrollCollection(SCROLL_DIRECTION.LEFT)}
                        />
                    )}
                    <ScrollContainer
                        ref={collectionWrapperRef}
                        onScroll={updateScrollObj}>
                        <CollectionCardWithActiveIndicator
                            latestFile={null}
                            active={activeCollection === ALL_SECTION}
                            onClick={clickHandler(ALL_SECTION)}>
                            {constants.ALL_SECTION_NAME}
                        </CollectionCardWithActiveIndicator>
                        {collections.map((item) => (
                            <CollectionCardWithActiveIndicator
                                key={item.id}
                                latestFile={
                                    collectionSummaries.get(item.id)?.latestFile
                                }
                                ref={collectionChipsRef[item.id]}
                                active={activeCollection === item.id}
                                onClick={clickHandler(item.id)}>
                                {item.name}
                            </CollectionCardWithActiveIndicator>
                        ))}
                        <CreateNewCollectionTile
                            onClick={showCreateCollectionModal}
                        />
                    </ScrollContainer>
                    {scrollObj.scrollLeft <
                        scrollObj.scrollWidth - scrollObj.clientWidth && (
                        <NavigationButton
                            scrollDirection={SCROLL_DIRECTION.RIGHT}
                            onClick={scrollCollection(SCROLL_DIRECTION.RIGHT)}
                        />
                    )}
                </CollectionWithNavigationContainer>
            </CollectionBarWrapper>
        </Hider>
    );
}
