import React, { useEffect, useState } from 'react';
import Photoswipe from 'photoswipe';
import PhotoswipeUIDefault from 'photoswipe/dist/photoswipe-ui-default';
import classnames from 'classnames';
import events from './events';
import FavButton from 'components/FavButton';
import { addToFavorites } from 'services/collectionService';
import { file } from 'services/fileService';

interface Iprops {
    isOpen: boolean
    items: any[];
    options?: Object;
    onClose?: () => void;
    gettingData?: (instance: any, index: number, item: file) => void;
    id?: string;
    className?: string;
    favItemIds: Set<number>;
    setFavItemIds: (favItemIds: Set<number>) => void;
    refetchData: () => void;
};

function PhotoSwipe(props: Iprops) {

    let pswpElement;
    const [photoSwipe, setPhotoSwipe] = useState<Photoswipe<any>>();

    const { isOpen } = props;
    const [isFav, setIsFav] = useState(false)


    useEffect(() => {
        if (!pswpElement)
            return;
        if (isOpen)
            openPhotoSwipe();

    }, [pswpElement]);

    useEffect(() => {
        if (!pswpElement)
            return;
        if (isOpen) {
            openPhotoSwipe();
        }
        if (!isOpen) {
            closePhotoSwipe();
        }
        return () => {
            closePhotoSwipe();
        }
    }, [isOpen]);

    function updateFavButton() {
        console.log(this.currItem.id, props.favItemIds)
        setIsFav(isInFav(this?.currItem));
    }


    const openPhotoSwipe = () => {
        const { items, options } = props;
        let photoSwipe = new Photoswipe(pswpElement, PhotoswipeUIDefault, items, options);
        events.forEach((event) => {
            const callback = props[event];
            if (callback || event === 'destroy') {
                photoSwipe.listen(event, function (...args) {
                    if (callback) {
                        args.unshift(this);
                        callback(...args);
                    }
                    if (event === 'destroy') {
                        handleClose();
                    }
                });
            }
        });
        photoSwipe.listen('beforeChange', updateFavButton);
        photoSwipe.init();
        setPhotoSwipe(photoSwipe);

    };

    const updateItems = (items = []) => {
        photoSwipe.items = [];
        items.forEach((item) => {
            photoSwipe.items.push(item);
        });
        photoSwipe.invalidateCurrItems();
        photoSwipe.updateSize(true);
    };

    const closePhotoSwipe = () => {
        if (photoSwipe)
            photoSwipe.close();
    };

    const handleClose = () => {
        const { onClose } = props;
        if (onClose) {
            onClose();
        }
    };
    const isInFav = (file) => {
        const { favItemIds } = props;
        if (favItemIds && file) {
            return favItemIds.has(file.id);
        }
        else
            return false;
    }

    const onFavClick = (file) => {
        const { favItemIds, refetchData, setFavItemIds } = props;
        if (!isInFav(file)) {
            favItemIds.add(file.id);
            console.log("added to Favorites");
            setIsFav(true);
            setFavItemIds(favItemIds);
        }
        else {
            favItemIds.delete(file.id);
            console.log("removed from Favorites");
            setIsFav(false);
            setFavItemIds(favItemIds);

        }
    }
    const { id } = props;
    let { className } = props;
    className = classnames(['pswp', className]).trim();
    return (
        <div
            id={id}
            className={className}
            tabIndex={Number("-1")}
            role="dialog"
            aria-hidden="true"
            ref={(node) => {
                pswpElement = node;
            }}
        >
            <div className="pswp__bg" />
            <div className="pswp__scroll-wrap">
                <div className="pswp__container">
                    <div className="pswp__item" />
                    <div className="pswp__item" />
                    <div className="pswp__item" />
                </div>
                <div className="pswp__ui pswp__ui--hidden">
                    <div className="pswp__top-bar">
                        <div className="pswp__counter" />

                        <button
                            className="pswp__button pswp__button--close"
                            title="Share"
                        />
                        <button
                            className="pswp__button pswp__button--share"
                            title="Share"
                        />
                        <button
                            className="pswp__button pswp__button--fs"
                            title="Toggle fullscreen"
                        />
                        <button className="pswp__button pswp__button--zoom" title="Zoom in/out" />
                        <FavButton isClick={isFav} onClick={() => { onFavClick(photoSwipe?.currItem) }} />
                        <div className="pswp__preloader">
                            <div className="pswp__preloader__icn">
                                <div className="pswp__preloader__cut">
                                    <div className="pswp__preloader__donut" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
                        <div className="pswp__share-tooltip" />
                    </div>
                    <button
                        className="pswp__button pswp__button--arrow--left"
                        title="Previous (arrow left)"
                    />
                    <button
                        className="pswp__button pswp__button--arrow--right"
                        title="Next (arrow right)"
                    />
                    <div className="pswp__caption">
                        <div className="pswp__caption__center" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PhotoSwipe;